import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { MessageSquare, Upload, List, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

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

            {/* Feature Section */}
            <div className="bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mt-10">
                        <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                            {current.features.map((feature, index) => (
                                <motion.div
                                    key={feature.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    className="relative"
                                >
                                    <dt>
                                        <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                                            <feature.icon className="h-6 w-6" aria-hidden="true" />
                                        </div>
                                        <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                                    </dt>
                                    <dd className="mt-2 ml-16 text-base text-gray-500">
                                        {feature.desc}
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
