import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { api } from '../lib/api';
import { Search, Filter, Loader2, CheckCircle2, ChevronRight, Scale } from 'lucide-react';

export default function SchemesList() {
    const {
        language,
        matchedSchemes,
        schemesSummary,
        profile,
        sessionId,
        uploadedDocuments,
        addToCompareList,
        schemesCompareList
    } = useStore();

    const [schemes, setSchemes] = useState(matchedSchemes || []);
    const [isLoading, setIsLoading] = useState(!matchedSchemes.length);
    const [filter, setFilter] = useState('all');

    const isHindi = language === 'hi';

    useEffect(() => {
        // If no matched schemes, fetch all schemes
        const fetchSchemes = async () => {
            if (matchedSchemes.length === 0) {
                setIsLoading(true);
                try {
                    if (Object.keys(profile).length > 2) {
                        // If profile has some data, try to match
                        const res = await api.matchSchemes(sessionId, profile, language, uploadedDocuments);
                        if (res?.response) {
                            setSchemes(res.response.schemes);
                        }
                    } else {
                        // Otherwise just get all
                        const res = await api.getAllSchemes();
                        if (res?.schemes) {
                            setSchemes(res.schemes);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch schemes", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSchemes(matchedSchemes);
            }
        };

        fetchSchemes();
    }, [matchedSchemes, profile, language, sessionId, uploadedDocuments]);

    const categories = [
        { id: 'all', label_en: 'All Schemes', label_hi: 'सभी योजनाएं' },
        { id: 'agriculture', label_en: 'Agriculture', label_hi: 'कृषि' },
        { id: 'health', label_en: 'Health', label_hi: 'स्वास्थ्य' },
        { id: 'education', label_en: 'Education', label_hi: 'शिक्षा' },
        { id: 'housing', label_en: 'Housing', label_hi: 'आवास' },
        { id: 'financial', label_en: 'Financial', label_hi: 'वित्तीय' },
        { id: 'social_security', label_en: 'Social Security', label_hi: 'सामाजिक सुरक्षा' },
        { id: 'women_child', label_en: 'Women & Child', label_hi: 'महिला एवं बाल' },
    ];

    const filteredSchemes = filter === 'all'
        ? schemes
        : schemes.filter(s => s.categories?.includes(filter) || s.category === filter);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        {isHindi ? 'आपकी योग्य योजनाएं' : 'Eligible Schemes'}
                    </h2>
                    {schemesSummary && (
                        <div className="mt-2 text-sm text-gray-500 max-w-4xl bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                            <p className="text-blue-800">{schemesSummary}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Compare Banner */}
            {schemesCompareList.length > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 flex justify-between items-center shadow-sm sticky top-16 z-40">
                    <div className="flex items-center">
                        <Scale className="h-6 w-6 text-primary-600 mr-2" />
                        <span className="font-medium text-primary-800">
                            {schemesCompareList.length} {isHindi ? 'योजनाएं तुलना के लिए चुनी गईं' : 'Schemes selected for comparison'}
                        </span>
                    </div>
                    <Link
                        to="/compare"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                    >
                        {isHindi ? 'तुलना करें' : 'Compare Now'}
                    </Link>
                </div>
            )}

            {/* Filters */}
            <div className="mb-6 overflow-x-auto pb-2">
                <div className="flex space-x-2">
                    {categories.map((c) => (
                        <button
                            key={c.id}
                            onClick={() => setFilter(c.id)}
                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c.id
                                    ? 'bg-primary-600 text-white shadow-sm'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                        >
                            {isHindi ? c.label_hi : c.label_en}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                </div>
            ) : (
                /* Scheme Cards Grid */
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredSchemes.map((scheme, idx) => (
                        <div key={scheme.scheme_id || idx} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full">

                            {/* Card Header (Score + Title) */}
                            <div className="p-5 border-b border-gray-100 flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                        {scheme.category || (scheme.categories && scheme.categories[0]) || 'General'}
                                    </span>

                                    {scheme.eligibility_score && (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${scheme.eligibility_score >= 80 ? 'bg-green-100 text-green-800' :
                                                scheme.eligibility_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {scheme.eligibility_score}% Match
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                    {isHindi && scheme.name_hi ? scheme.name_hi : scheme.name_en}
                                </h3>

                                <p className="text-sm text-gray-500 line-clamp-3">
                                    {scheme.eligibility_reasoning ||
                                        (isHindi && scheme.description_hi ? scheme.description_hi : scheme.description_en)}
                                </p>

                                {/* Document Readiness Indicator */}
                                {scheme.document_readiness && scheme.document_readiness.total > 0 && (
                                    <div className="mt-4 flex items-center">
                                        <div className="flex-1">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-medium text-gray-600">{isHindi ? 'दस्तावेज़ की तैयारी' : 'Documents Ready'}</span>
                                                <span className="font-bold text-primary-600">{scheme.document_readiness.ready}/{scheme.document_readiness.total}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                <div
                                                    className="bg-primary-500 h-1.5 rounded-full"
                                                    style={{ width: `${scheme.document_readiness.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Card Footer Actions */}
                            <div className="bg-gray-50 px-5 py-3 flex justify-between items-center sm:px-6 mt-auto border-t border-gray-100">
                                <button
                                    onClick={() => addToCompareList(scheme.scheme_id)}
                                    disabled={schemesCompareList.length >= 3 && !schemesCompareList.includes(scheme.scheme_id)}
                                    className={`text-sm font-medium flex items-center ${schemesCompareList.includes(scheme.scheme_id)
                                            ? 'text-primary-600 font-bold'
                                            : schemesCompareList.length >= 3
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-600 hover:text-primary-600'
                                        }`}
                                >
                                    <Scale className="w-4 h-4 mr-1" />
                                    {schemesCompareList.includes(scheme.scheme_id)
                                        ? (isHindi ? 'तुलना में जोड़ा गया' : 'Added to compare')
                                        : (isHindi ? 'तुलना करें' : 'Compare')}
                                </button>

                                <Link
                                    to={`/schemes/${scheme.scheme_id}`}
                                    className="text-primary-600 hover:text-primary-900 font-medium text-sm flex items-center group"
                                >
                                    {isHindi ? 'विवरण देखें' : 'View Details'}
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && filteredSchemes.length === 0 && (
                <div className="text-center py-16">
                    <List className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{isHindi ? 'कोई योजना नहीं मिली' : 'No schemes found'}</h3>
                    <p className="mt-1 text-sm text-gray-500">{isHindi ? 'कृपया अपनी खोज या फ़िल्टर बदलें।' : 'Try changing your filters or updating your profile.'}</p>
                </div>
            )}
        </div>
    );
}
