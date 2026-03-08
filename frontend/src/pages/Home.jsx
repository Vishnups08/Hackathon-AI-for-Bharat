import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { MessageSquare, Upload, List, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import IndiaMapSection from '../components/IndiaMapSection';
import ScrollAnimationSection from '../components/ScrollAnimationSection';

export default function Home() {
    const { language } = useStore();

    const content = {
        hi: {
            title: "जन सहायक",
            subtitle: "भारत की सरकारी योजनाओं का लाभ उठाएं।",
            description: "एआई की मदद से तुरंत पता करें कि आप किन सरकारी योजनाओं के लिए पात्र हैं। अपना প্রোफ़ाइल बनाएं या दस्तावेज़ अपलोड करें।",
            cta: "अभी शुरू करें",
            features: [
                { title: "आसान बातचीत", desc: "हमसे अपनी भाषा में बात करें, हम आपकी पात्रता जांचेंगे।", icon: MessageSquare },
                { title: "दस्तावेज़ अपलोड", desc: "आधार कार्ड अपलोड करें और जानकारी अपने आप भरें।", icon: Upload },
                { title: "तुरंत परिणाम", desc: "सेकंडों में अपनी योग्य योजनाओं की सूची पाएं।", icon: List },
                { title: "सुरक्षित डेटा", desc: "आपका डेटा सुरक्षित है और सेव नहीं किया जाता है।", icon: ShieldCheck },
            ]
        },
        en: {
            title: "Jan Sahayak",
            subtitle: "Empowering Citizens with Government Schemes.",
            description: "Instantly discover government schemes you are eligible for using AI. Build your profile through a simple chat or upload documents.",
            cta: "Get Started Now",
            features: [
                { title: "Conversational", desc: "Chat in your language, we check your eligibility.", icon: MessageSquare },
                { title: "Document Upload", desc: "Upload Aadhaar to auto-fill your profile instantly.", icon: Upload },
                { title: "Instant Results", desc: "Get a curated list of eligible schemes in seconds.", icon: List },
                { title: "Secure Data", desc: "Your data is safe and never stored permanently.", icon: ShieldCheck },
            ]
        }
    };

    const current = content[language];

    return (
        <div className="bg-white min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-y-0 h-full w-full" aria-hidden="true">
                    <div className="relative h-full">
                        <svg
                            className="absolute right-full transform translate-y-1/3 translate-x-1/4 md:translate-y-1/2 sm:translate-x-1/2 lg:translate-x-full"
                            width={404}
                            height={784}
                            fill="none"
                            viewBox="0 0 404 784"
                        >
                            <defs>
                                <pattern id="e229dbec-10e9-49ee-8ec3-0286ca089edf" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                                    <rect x={0} y={0} width={4} height={4} className="text-gray-100" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width={404} height={784} fill="url(#e229dbec-10e9-49ee-8ec3-0286ca089edf)" />
                        </svg>
                        <svg
                            className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
                            width={404}
                            height={784}
                            fill="none"
                            viewBox="0 0 404 784"
                        >
                            <defs>
                                <pattern id="d2a68204-c383-44b1-b99f-42ccff4e5365" x={0} y={0} width={20} height={20} patternUnits="userSpaceOnUse">
                                    <rect x={0} y={0} width={4} height={4} className="text-gray-100" fill="currentColor" />
                                </pattern>
                            </defs>
                            <rect width={404} height={784} fill="url(#d2a68204-c383-44b1-b99f-42ccff4e5365)" />
                        </svg>
                    </div>
                </div>

                <div className="relative pt-6 pb-16 sm:pb-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-16 mx-auto max-w-7xl px-4 sm:mt-24 sm:px-6"
                    >
                        <div className="text-center">
                            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                                <span className="block">{current.title}</span>
                                <span className="block text-primary-600 mt-2">{current.subtitle}</span>
                            </h1>
                            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                                {current.description}
                            </p>
                        </div>

                        <div className="mt-10 sm:flex sm:justify-center">
                            <div className="rounded-md shadow">
                                <Link
                                    to="/chat"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                                >
                                    {current.cta}
                                    <MessageSquare className="ml-2 w-5 h-5" />
                                </Link>
                            </div>
                            <div className="mt-3 sm:mt-0 sm:ml-3">
                                <Link
                                    to="/schemes"
                                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 md:py-4 md:text-lg md:px-10 transition-colors"
                                >
                                    {language === 'hi' ? 'सभी योजनाएं देखें' : 'Browse All Schemes'}
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Stats Bar — Communicates scale of impact */}
            <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-teal-600 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '2,000+', label: language === 'hi' ? 'सरकारी योजनाएं' : 'Government Schemes' },
                            { value: '₹14L Cr', label: language === 'hi' ? 'वार्षिक बजट आवंटन' : 'Annual Budget' },
                            { value: '60%', label: language === 'hi' ? 'नागरिक अनजान हैं' : 'Citizens Unaware' },
                            { value: '30+', label: language === 'hi' ? 'योजनाएं डेटाबेस में' : 'Schemes in Database' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.4 }}
                                className="text-center"
                            >
                                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
                                <div className="mt-1 text-sm text-primary-100 font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Feature Section */}
            <div className="relative bg-gradient-to-b from-gray-50 to-white py-16 sm:py-24 overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                    <div className="absolute top-48 -right-24 w-96 h-96 bg-secondary-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
                    <div className="text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-base font-semibold text-primary-600 tracking-wide uppercase"
                        >
                            {language === 'hi' ? 'प्रमुख विशेषताएं' : 'Key Features'}
                        </motion.h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {current.features.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="relative bg-white pt-8 px-6 pb-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-1 group"
                            >
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="w-14 h-14 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                                    <feature.icon className="h-7 w-7" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-300">
                                    {feature.title}
                                </h3>
                                <p className="text-base text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* How It Works — 3-Step Flow */}
            <div className="py-16 sm:py-24 bg-white border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase mb-2">
                            {language === 'hi' ? 'कैसे काम करता है' : 'How It Works'}
                        </h2>
                        <p className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                            {language === 'hi' ? 'तीन आसान चरण' : 'Three Simple Steps'}
                        </p>
                    </motion.div>

                    <div className="relative">
                        {/* Connector line (desktop only) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200"></div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                {
                                    title_en: 'Chat or Upload', title_hi: 'बातचीत करें या अपलोड करें',
                                    desc_en: 'Tell us about yourself via a conversation or upload your Aadhaar/Ration Card.',
                                    desc_hi: 'बातचीत से अपनी जानकारी दें या आधार कार्ड अपलोड करें।',
                                    emoji: '💬'
                                },
                                {
                                    title_en: 'AI Matches Schemes', title_hi: 'AI योजनाएं खोजता है',
                                    desc_en: 'Our AI analyzes your profile against 30+ government schemes and provides a match score.',
                                    desc_hi: 'हमारा AI आपकी प्रोफ़ाइल की 30+ सरकारी योजनाओं से तुलना करता है।',
                                    emoji: '🤖'
                                },
                                {
                                    title_en: 'Apply with Guidance', title_hi: 'आवेदन करें',
                                    desc_en: 'Get step-by-step application guidance, missing document alerts, and scheme comparison.',
                                    desc_hi: 'चरण-दर-चरण आवेदन मार्गदर्शन और दस्तावेज़ सूची प्राप्त करें।',
                                    emoji: '✅'
                                }
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.step}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.15, duration: 0.5 }}
                                    className="text-center relative"
                                >
                                    <div className="w-24 h-24 rounded-full bg-primary-50 border-4 border-white shadow-lg mx-auto flex items-center justify-center mb-6 relative z-10">
                                        <span className="text-4xl">{item.emoji}</span>
                                    </div>
                                    <div className="absolute top-2 right-1/2 translate-x-1/2 w-6 h-6 bg-primary-600 text-white rounded-full text-xs font-bold flex items-center justify-center z-20 shadow">
                                        {item.step}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        {language === 'hi' ? item.title_hi : item.title_en}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">
                                        {language === 'hi' ? item.desc_hi : item.desc_en}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Nationwide Impact Map Section */}
            <IndiaMapSection />

            {/* Scroll Animation Sequence */}
            <ScrollAnimationSection />
        </div>
    );
}
