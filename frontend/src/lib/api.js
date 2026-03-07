import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Chat feature
    chat: async (sessionId, message, language, chatHistory, currentProfile) => {
        const response = await apiClient.post('/chat', {
            session_id: sessionId,
            message,
            language,
            chat_history: chatHistory,
            current_profile: currentProfile,
        });
        return response.data;
    },

    // Document upload feature
    uploadDocument: async (file, sessionId, language) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', sessionId);
        formData.append('language', language);

        const response = await apiClient.post('/document/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Schemes features
    matchSchemes: async (sessionId, profile, language, uploadedDocs = []) => {
        const response = await apiClient.post('/schemes/match', {
            session_id: sessionId,
            profile,
            language,
            uploaded_documents: uploadedDocs,
            max_results: 10,
        });
        return response.data;
    },

    compareSchemes: async (sessionId, schemeIds, profile, language) => {
        const response = await apiClient.post('/schemes/compare', {
            session_id: sessionId,
            scheme_ids: schemeIds,
            profile,
            language,
        });
        return response.data;
    },

    getSchemeDetails: async (schemeId) => {
        const response = await apiClient.get(`/schemes/${schemeId}`);
        return response.data;
    },

    getAllSchemes: async (category = '') => {
        const url = category ? `/schemes?category=${category}` : '/schemes';
        const response = await apiClient.get(url);
        return response.data;
    },

    // Voice features
    synthesizeVoice: async (text, language) => {
        const formData = new FormData();
        formData.append('text', text);
        formData.append('language', language);

        const response = await apiClient.post('/voice/synthesize', formData, {
            responseType: 'blob',
        });
        return response.data; // Returns audio blob
    },

    transcribeVoice: async (audioBlob, language) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);

        const response = await apiClient.post('/voice/transcribe', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
