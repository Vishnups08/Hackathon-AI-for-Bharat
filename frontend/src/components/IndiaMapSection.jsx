
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { motion } from "framer-motion";
import { useStore } from '../stores/useStore';

const geoUrl = "/india.topo.json";

import stateCenters from '../stateCenters.json';

const markers = stateCenters;

export default function IndiaMapSection() {
    const { language } = useStore();

    return (
        <div className="relative py-16 sm:py-24 bg-gray-50 overflow-hidden border-t border-gray-100">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-5/12 mb-12 lg:mb-0 lg:pr-8">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl mb-6">
                            {language === 'hi' ? 'राष्ट्रव्यापी प्रभाव' : 'Nationwide Impact'}
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            {language === 'hi'
                                ? 'हम पूरे भारत में सरकारी योजनाओं का लाभ सही लोगों तक पहुंचा रहे हैं। करोड़ों की सहायता राशि पारदर्शी तरीके से वितरित की जा रही है।'
                                : 'Empowering citizens across India by connecting them with the right government schemes. Crores of assistance have been distributed transparently.'}
                        </p>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mb-4 text-primary-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                    {language === 'hi' ? 'कुल राशि वितरित' : 'Total Amount Disbursed'}
                                </p>
                                <motion.p
                                    className="text-3xl font-extrabold text-primary-700"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    ₹4,380 Cr+
                                </motion.p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center mb-4 text-secondary-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                </div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                                    {language === 'hi' ? 'कुल लाभार्थी' : 'Total Beneficiaries'}
                                </p>
                                <motion.p
                                    className="text-3xl font-extrabold text-secondary-700"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                >
                                    2.5M+
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="w-full lg:w-7/12 h-[500px] lg:h-[600px] relative">
                    {/* Abstract circular decorations behind the map */}
                    <motion.div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3]
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />

                    <motion.div
                        className="w-full h-full relative z-10"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <ComposableMap
                            projection="geoMercator"
                            projectionConfig={{
                                scale: 1000,
                                center: [82, 23]
                            }}
                            className="w-full h-full"
                        >
                            <Geographies geography={geoUrl}>
                                {({ geographies }) =>
                                    geographies.map(geo => (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            fill="#e2e8f0"
                                            stroke="#cbd5e1"
                                            strokeWidth={0.5}
                                            style={{
                                                default: { outline: "none" },
                                                hover: { fill: "#cbd5e1", outline: "none", transition: "all 250ms" },
                                                pressed: { fill: "#94a3b8", outline: "none" },
                                            }}
                                        />
                                    ))
                                }
                            </Geographies>
                            {markers.map(({ name, coordinates }, i) => (
                                <Marker key={name} coordinates={coordinates}>


                                    <motion.text
                                        textAnchor="middle"
                                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                        whileInView={{
                                            opacity: [0, 1, 0],
                                            y: [0, -30],
                                            scale: [0.5, 1.2, 1]
                                        }}
                                        viewport={{ once: false, margin: "-50px" }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 2.5,
                                            ease: "easeOut",
                                            delay: i * 0.3 + 0.5
                                        }}
                                        style={{
                                            fontFamily: "Inter, sans-serif",
                                            fill: "#0ea5e9",
                                            fontSize: "22px",
                                            fontWeight: "800",
                                            filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.2))"
                                        }}
                                    >
                                        ₹
                                    </motion.text>
                                </Marker>
                            ))}
                        </ComposableMap>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
