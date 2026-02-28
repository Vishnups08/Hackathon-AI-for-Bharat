import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../stores/useStore';
import { api } from '../lib/api';
import { ArrowLeft, Loader2, Scale, Trash2, CheckCircle2 } from 'lucide-react';

export default function CompareSchemes() {
    const navigate = useNavigate();
    const {
        language,
        schemesCompareList,
        clearCompareList,
        comparisonResult,
        setComparisonResult,
        sessionId,
        profile
    } = useStore();

    const [isLoading, setIsLoading] = useState(false);
    const isHindi = language === 'hi';

    const fetchComparison = async () => {
        if (schemesCompareList.length < 2) return;

        setIsLoading(true);
        try {
            const res = await api.compareSchemes(sessionId, schemesCompareList, profile, language);
            if (res?.response) {
                setComparisonResult(res.response);
            }
        } catch (err) {
            console.error("Failed to compare schemes", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Only fetch if we have 2-3 schemes and haven't fetched yet
        if (schemesCompareList.length >= 2 && !comparisonResult) {
            fetchComparison();
        }
    }, [schemesCompareList.length]);

    if (schemesCompareList.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <Scale className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {isHindi ? 'तुलना के लिए कोई योजना नहीं' : 'No schemes selected for comparison'}
                </h2>
                <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {isHindi
                        ? 'योजनाओं की सूची में जाएं और उनकी तुलना करने के लिए 2-3 योजनाओं का चयन करें।'
                        : 'Go to the schemes list and select 2-3 schemes to compare them side-by-side.'}
                </p>
                <Link
                    to="/schemes"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
                >
                    {isHindi ? 'योजनाएं खोजें' : 'Browse Schemes'}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link to="/schemes" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-2">
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        {isHindi ? 'वापस जाएं' : 'Back to schemes'}
                    </Link>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        {isHindi ? 'योजनाओं की तुलना' : 'Compare Schemes'}
                    </h2>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={() => { clearCompareList(); navigate('/schemes'); }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4 text-gray-400" />
                        {isHindi ? 'साफ करें' : 'Clear All'}
                    </button>

                    <button
                        onClick={fetchComparison}
                        disabled={schemesCompareList.length < 2 || isLoading}
                        className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${schemesCompareList.length < 2 || isLoading
                                ? 'bg-primary-300 cursor-not-allowed'
                                : 'bg-primary-600 hover:bg-primary-700'
                            }`}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Scale className="mr-2 h-4 w-4" />
                        )}
                        {isHindi ? 'तुलना अपडेट करें' : 'Update Comparison'}
                    </button>
                </div>
            </div>

            {schemesCompareList.length === 1 && !comparisonResult && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                {isHindi
                                    ? 'तुलना करने के लिए कम से कम 2 योजनाओं का चयन करें।'
                                    : 'Please select at least 2 schemes to compare.'}
                                <Link to="/schemes" className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600">
                                    {isHindi ? 'एक और चुनें' : 'Select another'}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-500 mx-auto mb-4" />
                        <p className="text-gray-500 text-sm">
                            {isHindi ? 'तुलना की जा रही है...' : 'AI is comparing selected schemes...'}
                        </p>
                    </div>
                </div>
            ) : comparisonResult ? (
                <div className="space-y-8">

                    {/* AI Recommendation Box */}
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200 shadow-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0 mt-0.5">
                                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                                    <CheckCircle2 className="h-5 w-5 text-primary-600" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {isHindi ? 'AI सुझाव' : 'AI Recommendation'}
                                </h3>
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                    {comparisonResult.recommendation}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/4">
                                            {isHindi ? 'विवरण' : 'Feature'}
                                        </th>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => (
                                            <th key={idx} scope="col" className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                                                {scheme.name}
                                                {idx === 0 && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        {isHindi ? 'सर्वश्रेष्ठ विकल्प' : 'Best Choice'}
                                                    </span>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">

                                    {/* Benefit Row */}
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50/50">
                                            {isHindi ? 'लाभ' : 'Benefit'}
                                        </td>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => (
                                            <td key={idx} className="px-6 py-4 text-sm text-gray-700">
                                                {scheme.benefit}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Documents Ready Row */}
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50/50">
                                            {isHindi ? 'दस्तावेज़ की तैयारी' : 'Documents Ready'}
                                        </td>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => {
                                            const [ready, total] = (scheme.docs_ready || "0/0").split('/');
                                            const isFull = ready === total && total !== "0";
                                            return (
                                                <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isFull ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {scheme.docs_ready} {isHindi ? 'तैयार' : 'Ready'}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Complexity Row */}
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50/50">
                                            {isHindi ? 'आवेदन जटिलता' : 'Application Complexity'}
                                        </td>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => {
                                            const diff = scheme.complexity?.toLowerCase() || '';
                                            return (
                                                <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`capitalize ${diff.includes('easy') || diff.includes('आसान') ? 'text-green-600 font-medium' :
                                                            diff.includes('medium') || diff.includes('मध्यम') ? 'text-yellow-600 font-medium' :
                                                                'text-red-600 font-medium'
                                                        }`}>
                                                        {scheme.complexity}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Time Row */}
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 bg-gray-50/50 border-b">
                                            {isHindi ? 'लाभ मिलने का समय' : 'Time to Benefit'}
                                        </td>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => (
                                            <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-b">
                                                {scheme.time_to_benefit}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Actions Row */}
                                    <tr className="bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                                            {isHindi ? 'कार्रवाई' : 'Action'}
                                        </td>
                                        {comparisonResult.comparison_table?.map((scheme, idx) => (
                                            <td key={idx} className="px-6 py-4 whitespace-nowrap">
                                                <Link
                                                    to={`/schemes/${scheme.scheme_id}`}
                                                    className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${idx === 0 ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-600 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    {isHindi ? 'आवेदन करें' : 'Apply Now'}
                                                </Link>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
