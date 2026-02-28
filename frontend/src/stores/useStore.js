import { create } from 'zustand';

// Generate a random session ID once when the app loads
const initialSessionId = `session_${Math.random().toString(36).substring(2, 10)}`;

export const useStore = create((set) => ({
    // Core App State
    sessionId: initialSessionId,
    language: 'hi',
    isVoiceEnabled: false,

    // Profile Data
    profile: {},
    profileCompleteness: 0,

    // Chat History
    chatHistory: [],
    suggestedActions: [],
    isChatLoading: false,

    // Document State
    uploadedDocuments: [],
    isDocumentProcessing: false,
    extractedDocumentData: null,

    // Schemes State
    matchedSchemes: [],
    schemesSummary: '',
    schemesCompareList: [],
    comparisonResult: null,

    // Actions
    setLanguage: (lang) => set({ language: lang }),
    toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),

    updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
    })),

    setProfileCompleteness: (percent) => set({ profileCompleteness: percent }),

    addChatMessage: (msg) => set((state) => ({
        chatHistory: [...state.chatHistory, msg]
    })),

    setChatLoading: (loading) => set({ isChatLoading: loading }),
    setSuggestedActions: (actions) => set({ suggestedActions: actions }),

    addUploadedDocument: (docInfo) => set((state) => ({
        uploadedDocuments: [...state.uploadedDocuments, docInfo]
    })),

    setDocumentProcessing: (processing) => set({ isDocumentProcessing: processing }),
    setExtractedDocumentData: (data) => set({ extractedDocumentData: data }),

    setMatchedSchemes: (schemes) => set({ matchedSchemes: schemes }),
    setSchemesSummary: (summary) => set({ schemesSummary: summary }),

    addToCompareList: (schemeId) => set((state) => {
        // Only allow up to 3 schemes for comparison
        if (state.schemesCompareList.includes(schemeId)) {
            return { schemesCompareList: state.schemesCompareList.filter(id => id !== schemeId) };
        }
        if (state.schemesCompareList.length < 3) {
            return { schemesCompareList: [...state.schemesCompareList, schemeId] };
        }
        return state;
    }),

    clearCompareList: () => set({ schemesCompareList: [], comparisonResult: null }),
    setComparisonResult: (result) => set({ comparisonResult: result }),
}));
