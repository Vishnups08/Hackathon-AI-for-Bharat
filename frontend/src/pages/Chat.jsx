import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { api } from '../lib/api';
import { Send, Upload, Mic, Loader2, FileCheck, Info, List as ListIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Chat() {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const {
        sessionId, language, profile, updateProfile,
        chatHistory, addChatMessage, isChatLoading, setChatLoading,
        suggestedActions, setSuggestedActions,
        setProfileCompleteness, profileCompleteness,
        isVoiceEnabled,
        addUploadedDocument, setExtractedDocumentData,
        setMatchedSchemes, setSchemesSummary
    } = useStore();

    const isHindi = language === 'hi';

    const hasGreeted = useRef(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory, isChatLoading]);

    // Initial greeting — runs once only (guarded against StrictMode double-render)
    useEffect(() => {
        if (chatHistory.length === 0 && !hasGreeted.current) {
            hasGreeted.current = true;
            const greeting = isHindi
                ? "नमस्ते! मैं जन सहायक हूँ। मैं आपको सरकारी योजनाओं का लाभ उठाने में मदद करूँगा। क्या आप अपना नाम या कोई दस्तावेज़ (जैसे आधार कार्ड) अपलोड करना चाहेंगे?"
                : "Hello! I am Jan Sahayak. I will help you discover government schemes. Would you like to tell me your name or upload a document like an Aadhaar card?";

            addChatMessage({ role: 'assistant', content: greeting });
            setSuggestedActions([
                { type: 'continue_chat', label: isHindi ? "मेरा नाम..." : "My name is..." },
                { type: 'upload_document', label: isHindi ? "आधार कार्ड अपलोड करें" : "Upload Aadhaar" }
            ]);

            if (isVoiceEnabled) {
                playVoice(greeting, language);
            }
        }
    }, []);

    const playVoice = async (text, lang) => {
        try {
            const audioBlob = await api.synthesizeVoice(text, lang);
            const url = URL.createObjectURL(audioBlob);
            const audio = new Audio(url);
            audio.play();
        } catch (error) {
            console.error('Voice playback failed:', error);
        }
    };

    const handleSend = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!input.trim() || isChatLoading) return;

        const userMsg = input.trim();
        setInput('');
        addChatMessage({ role: 'user', content: userMsg });
        setChatLoading(true);

        try {
            const res = await api.chat(sessionId, userMsg, language, chatHistory, profile);

            if (res?.response) {
                addChatMessage({ role: 'assistant', content: res.response.message });

                // Update profile silently in background
                if (res.response.extracted_profile_updates) {
                    updateProfile(res.response.extracted_profile_updates);
                }

                if (res.response.profile_completeness !== undefined) {
                    setProfileCompleteness(res.response.profile_completeness);
                }

                if (res.response.suggested_actions) {
                    setSuggestedActions(res.response.suggested_actions);
                }

                if (isVoiceEnabled) {
                    playVoice(res.response.message, language);
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            addChatMessage({
                role: 'assistant',
                content: isHindi ? 'क्षमा करें, सर्वर से संपर्क नहीं हो पाया। कृपया पुनः प्रयास करें।' : 'Sorry, could not connect to the server. Please try again.'
            });
        } finally {
            setChatLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        addChatMessage({
            role: 'user',
            content: isHindi ? `[दस्तावेज़ अपलोड किया गया: ${file.name}]` : `[Document uploaded: ${file.name}]`
        });
        setChatLoading(true);

        try {
            const res = await api.uploadDocument(file, sessionId, language);

            if (res?.response) {
                addUploadedDocument(res.response.detected_document_type);
                setExtractedDocumentData(res.response.extracted_data);

                let msg = res.response.message + "\n\n";
                const data = res.response.extracted_data;
                if (data.name) msg += `Name: ${data.name}\n`;
                if (data.age) msg += `Age: ${data.age}\n`;
                if (data.gender) msg += `Gender: ${data.gender}\n`;
                if (data.document_number_masked) msg += `ID: ${data.document_number_masked}\n`;
                if (data.address?.state) msg += `State: ${data.address.state}\n`;
                if (data.address?.district) msg += `District: ${data.address.district}\n`;

                addChatMessage({ role: 'assistant', content: msg });

                if (isVoiceEnabled) {
                    playVoice(res.response.message, language);
                }

                if (res.response.profile_updates) {
                    updateProfile(res.response.profile_updates);
                    // Set completeness artificially higher if Aadhaar uploaded
                    setProfileCompleteness((prev) => Math.min(prev + 30, 100));
                }

                // Add auto-action to confirm
                setSuggestedActions([
                    { type: 'confirm_doc', label: isHindi ? "हाँ, जानकारी सही है" : "Yes, this is correct" },
                    { type: 'reject_doc', label: isHindi ? "नहीं, पुनः प्रयास करें" : "No, try again" }
                ]);
            }
        } catch (error) {
            console.error('Document error:', error);
            addChatMessage({
                role: 'assistant',
                content: isHindi ? 'दस्तावेज़ पढ़ने में समस्या आई।' : 'There was an issue reading the document.'
            });
        } finally {
            setChatLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleActionClick = async (action) => {
        if (action.type === 'continue_chat') {
            const inputEl = document.getElementById('chat-input');
            if (inputEl) {
                inputEl.focus();
                // If label is "My name is...", pre-fill it for better UX
                if (action.label.includes('...') || action.label.includes('नाम')) {
                    setInput(action.label.replace('...', ' '));
                }
            }
        } else if (action.type === 'upload_document') {
            fileInputRef.current?.click();
        } else if (action.type === 'confirm_doc' || action.type === 'reject_doc') {
            const val = action.label;
            setInput(val);
            // Small delay to ensure state update before triggering submit
            setTimeout(() => {
                const form = document.getElementById('chat-form');
                if (form) {
                    form.requestSubmit();
                }
            }, 50);
        } else if (action.type === 'find_schemes') {
            setChatLoading(true);
            try {
                const res = await api.matchSchemes(sessionId, profile, language, []);
                if (res?.response) {
                    setMatchedSchemes(res.response.schemes);
                    setSchemesSummary(res.response.ai_summary);
                    navigate('/schemes');
                }
            } catch (err) {
                console.error('Matching error:', err);
            } finally {
                setChatLoading(false);
            }
        }
    };

    const startSpeechRecognition = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstart = () => {
                setIsRecording(true);
            };

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                stream.getTracks().forEach(track => track.stop());

                setIsTranscribing(true);
                try {
                    const res = await api.transcribeVoice(audioBlob, language);
                    if (res && res.text) {
                        setInput(prev => (prev + ' ' + res.text).trim());
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    addChatMessage({
                        role: 'assistant',
                        content: isHindi ? 'ऑडियो प्रोसेस करने में समस्या हुई। कृपया पुनः प्रयास करें।' : 'Sorry, there was an error processing your audio. Please try again.'
                    });
                } finally {
                    setIsTranscribing(false);
                }
            };

            mediaRecorder.start();
        } catch (err) {
            console.error('Microphone access denied:', err);
            addChatMessage({
                role: 'assistant',
                content: isHindi ? 'कृपया माइक्रोफ़ोन को अनुमति दें।' : 'Please allow microphone access.'
            });
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto w-full p-4">
            {/* Profile Progress Header */}
            <div className="bg-white rounded-t-xl p-4 shadow-sm border-b">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">
                        {isHindi ? 'प्रोफाइल की जानकारी' : 'Profile Completeness'}
                    </span>
                    <span className="text-sm font-bold text-primary-600">{profileCompleteness}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${profileCompleteness}%` }}
                    ></div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4 rounded-b-xl shadow-inner border-x border-b">
                {chatHistory.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                            ? 'bg-primary-600 text-white rounded-tr-none'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm pb-5 whitespace-pre-line'
                            }`}>
                            {msg.role === 'user' ? msg.content : (
                                <div className="space-y-1">
                                    {msg.content.split('\n').map((line, lineIdx) => {
                                        // Simple markdown-ish bold and bullet handling
                                        let processed = line;

                                        // Bullet points
                                        const isBullet = processed.trim().startsWith('*');
                                        if (isBullet) {
                                            processed = processed.replace(/^\*\s*/, '');
                                        }

                                        // Bold
                                        const parts = processed.split(/(\*\*.*?\*\*)/g);
                                        const element = (
                                            <span key={lineIdx}>
                                                {parts.map((part, pIdx) => {
                                                    if (part.startsWith('**') && part.endsWith('**')) {
                                                        return <strong key={pIdx} className="font-bold">{part.slice(2, -2)}</strong>;
                                                    }
                                                    return part;
                                                })}
                                            </span>
                                        );

                                        return (
                                            <div key={lineIdx} className={isBullet ? "flex items-start" : ""}>
                                                {isBullet && <span className="mr-2 text-primary-500">•</span>}
                                                {element}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}

                {isChatLoading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-4 shadow-sm flex space-x-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
                            <span className="text-gray-500 text-sm">{isHindi ? 'टाइप कर रहा है...' : 'Thinking...'}</span>
                        </div>
                    </motion.div>
                )}

                {isTranscribing && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex justify-end"
                    >
                        <div className="bg-primary-50 border border-primary-200 rounded-2xl p-3 shadow-sm flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin text-primary-500" />
                            <span className="text-primary-700 text-sm">{isHindi ? 'आवाज़ को प्रोसेस कर रहा है...' : 'Transcribing voice...'}</span>
                        </div>
                    </motion.div>
                )}

                {/* Suggested Actions */}
                {!isChatLoading && suggestedActions.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-wrap gap-2 mt-4 ml-2"
                    >
                        {suggestedActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleActionClick(action)}
                                className="flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200 hover:bg-primary-100 transition-colors"
                            >
                                {action.type === 'upload_document' ? <Upload className="w-4 h-4 mr-2" /> : null}
                                {action.type === 'find_schemes' ? <ListIcon className="w-4 h-4 mr-2" /> : null}
                                {action.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 bg-white rounded-xl shadow-sm border p-2">
                <form id="chat-form" onSubmit={handleSend} className="flex items-center space-x-2">

                    <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                        title={isHindi ? "दस्तावेज़ अपलोड करें" : "Upload Document"}
                    >
                        <Upload className="w-6 h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={startSpeechRecognition}
                        className={`p-3 rounded-full transition-colors ${isRecording ? 'text-red-600 bg-red-50 animate-pulse' : 'text-gray-500 hover:text-primary-600 hover:bg-primary-50'}`}
                        title={isHindi ? "बोलकर टाइप करें" : "Voice Typing"}
                    >
                        <Mic className="w-6 h-6" />
                    </button>

                    <div className="relative flex-1">
                        <input
                            id="chat-input"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isHindi ? "आप क्या जानना चाहते हैं?" : "Type your message..."}
                            className="w-full px-4 py-3 bg-gray-100 border-transparent rounded-full focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                            disabled={isChatLoading || isTranscribing}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!input.trim() || isChatLoading || isTranscribing}
                        className={`p-3 rounded-full flex items-center justify-center transition-colors ${!input.trim() || isChatLoading || isTranscribing
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'
                            }`}
                    >
                        <Send className="w-6 h-6 ml-1" />
                    </button>
                </form>
            </div>
        </div>
    );
}
