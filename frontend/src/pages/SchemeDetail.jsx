import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { api } from '../lib/api';
import { ArrowLeft, CheckCircle, XCircle, Info, ExternalLink, Phone, Building, Globe } from 'lucide-react';

export default function SchemeDetail() {
    const { id } = useParams();
    const { language, matchedSchemes, profile } = useStore();
    const [scheme, setScheme] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const isHindi = language === 'hi';

    useEffect(() => {
        const fetchDetail = async () => {
            setIsLoading(true);
            try {
                // Find in matched schemes to retain AI scores
                const matched = matchedSchemes.find(s => s.scheme_id === id);

                // Fetch full scheme details from API
                const res = await api.getSchemeDetails(id);
                if (res?.scheme) {
                    const fullScheme = res.scheme;
                    // Merge matching info if available
                    if (matched) {
                        fullScheme.eligibility_score = matched.eligibility_score;
                        fullScheme.eligibility_reasoning = matched.eligibility_reasoning;
                        fullScheme.document_readiness = matched.document_readiness;
                    }
                    setScheme(fullScheme);
                } else if (matched) {
                    setScheme(matched);
                }
            } catch (err) {
                console.error("Failed to load scheme details", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetail();
    }, [id, matchedSchemes]);

    if (isLoading) {
        return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    if (!scheme) {
        return <div className="p-8 text-center text-gray-500">Scheme not found.</div>;
    }

    const name = isHindi && scheme.name_hi ? scheme.name_hi : scheme.name_en;
    const description = isHindi && scheme.description_hi ? scheme.description_hi : scheme.description_en;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
            <Link to="/schemes" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-6">
                <ArrowLeft className="mr-1 h-4 w-4" />
                {isHindi ? 'सभी योजनाओं पर वापस जाएं' : 'Back to all schemes'}
            </Link>

            {/* Header */}
            <div className="bg-white px-6 py-8 border-b border-gray-200 sm:px-8 rounded-t-xl shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {scheme.ministry}
                    </span>
                    {scheme.eligibility_score && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            {scheme.eligibility_score}% Match
                        </span>
                    )}
                </div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900 mb-4">{name}</h1>
                <p className="text-lg text-gray-500 leading-relaxed">{description}</p>
            </div>

            <div className="bg-white rounded-b-xl shadow-sm">
                {/* Benefits Section */}
                <div className="px-6 py-6 sm:px-8 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{isHindi ? 'लाभ' : 'Benefits'}</h2>
                    <div className="bg-primary-50 rounded-lg p-5 border border-primary-100">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-primary-800">{isHindi ? 'लाभ का प्रकार' : 'Benefit Type'}</dt>
                                <dd className="mt-1 text-sm text-gray-900 capitalize">{scheme.benefits?.type || 'N/A'}</dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-primary-800">{isHindi ? 'राशि / विवरण' : 'Amount / Details'}</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">{scheme.benefits?.amount || 'N/A'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-primary-800">{isHindi ? 'अतिरिक्त विवरण' : 'Additional Details'}</dt>
                                <dd className="mt-1 text-sm text-gray-900">{scheme.benefits?.details || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Documents Required */}
                {scheme.documents_required && (
                    <div className="px-6 py-6 sm:px-8 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">{isHindi ? 'आवश्यक दस्तावेज़' : 'Documents Required'}</h2>
                        <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                            {scheme.documents_required.map((doc, idx) => {
                                // Determine if doc is ready based on scheme.document_readiness (calculated in backend)
                                // If not available, we assume missing for display
                                const docStatusObj = scheme.document_readiness?.documents?.find(d => d.name === doc.document_name);
                                const isReady = docStatusObj?.status === 'available';

                                return (
                                    <li key={idx} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between ${isReady ? 'bg-green-50' : 'bg-white'}`}>
                                        <div className="flex items-start">
                                            {isReady ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-gray-300 mt-0.5 mr-3 flex-shrink-0" />
                                            )}
                                            <div>
                                                <p className={`text-sm font-medium ${isReady ? 'text-green-800' : 'text-gray-900'}`}>
                                                    {doc.document_name}
                                                    {doc.is_mandatory && <span className="ml-2 text-xs text-red-500 font-normal border border-red-200 rounded px-1">{isHindi ? 'अनिवार्य' : 'Mandatory'}</span>}
                                                </p>
                                                {!isReady && doc.where_to_obtain && (
                                                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                                                        <Building className="h-3 w-3 mr-1" />
                                                        {isHindi ? 'कहाँ मिलेगा: ' : 'Get it from: '}
                                                        <span className="font-medium text-gray-700 ml-1">{doc.where_to_obtain}</span>
                                                    </p>
                                                )}
                                                {!isReady && doc.estimated_time && (
                                                    <p className="mt-0.5 text-xs text-gray-500">
                                                        {isHindi ? 'समय सीमा: ' : 'Estimated time: '} {doc.estimated_time}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}

                {/* Application Process */}
                <div className="px-6 py-6 sm:px-8 bg-gray-50 rounded-b-xl border-t border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">{isHindi ? 'आवेदन प्रक्रिया' : 'How to Apply'}</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Online Process */}
                        {scheme.application_process?.online && (
                            <div className="bg-white p-5 rounded-lg border shadow-sm">
                                <h3 className="text-lg font-medium text-primary-700 flex items-center mb-3">
                                    <Globe className="h-5 w-5 mr-2" />
                                    {isHindi ? 'ऑनलाइन आवेदन' : 'Online Application'}
                                </h3>
                                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 mb-4">
                                    {scheme.application_process.online.steps?.map((step, idx) => (
                                        <li key={idx} className="pl-1">{step}</li>
                                    ))}
                                </ol>
                                {scheme.application_process.online.portal_url && (
                                    <a
                                        href={scheme.application_process.online.portal_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                                    >
                                        {isHindi ? 'पोर्टल पर जाएं' : 'Visit Portal'}
                                        <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Offline Process */}
                        {scheme.application_process?.offline && (
                            <div className="bg-white p-5 rounded-lg border shadow-sm">
                                <h3 className="text-lg font-medium text-blue-700 flex items-center mb-3">
                                    <Building className="h-5 w-5 mr-2" />
                                    {isHindi ? 'ऑफ़लाइन आवेदन' : 'Offline Application'}
                                </h3>
                                {scheme.application_process.offline.office && (
                                    <p className="text-sm font-medium text-gray-900 mb-2">
                                        {isHindi ? 'कार्यालय: ' : 'Visit Office: '}
                                        <span className="text-gray-600 font-normal">{scheme.application_process.offline.office}</span>
                                    </p>
                                )}
                                <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
                                    {scheme.application_process.offline.steps?.map((step, idx) => (
                                        <li key={idx} className="pl-1">{step}</li>
                                    ))}
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Contact Info */}
                    <div className="mt-6 flex flex-wrap items-center justify-between bg-white px-4 py-3 rounded-lg border">
                        {scheme.helpline && (
                            <div className="flex items-center text-sm font-medium text-gray-900">
                                <Phone className="h-5 w-5 text-primary-500 mr-2" />
                                {isHindi ? 'हेल्पलाइन: ' : 'Helpline: '} <a href={`tel:${scheme.helpline}`} className="ml-1 text-primary-600 hover:underline">{scheme.helpline}</a>
                            </div>
                        )}
                        {scheme.application_process?.via_csc && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                {isHindi ? 'सीएससी के माध्यम से उपलब्ध' : 'Available via CSC Center'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
