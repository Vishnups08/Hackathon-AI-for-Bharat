# Design Document — Jan Sahayak (जन सहायक)
## AI-Powered Government Scheme Eligibility & Guidance Platform

---

## 1. System Overview

### 1.1 Solution Summary
Jan Sahayak is a **React-based, AI-powered web application** that enables Indian citizens to discover eligible government welfare schemes through conversational AI, document intelligence, and multilingual support. The system combines a modern React frontend with a Python FastAPI backend, leveraging LLMs, OCR, RAG, and speech processing to deliver a seamless, inclusive experience.

### 1.2 Design Principles

| Principle | Description |
|---|---|
| **Voice-First, Text-Always** | Design for voice interaction as primary mode, but ensure full functionality via text for fallback |
| **AI-Native, Not AI-Wrapped** | AI is the core engine, not a bolt-on. Remove AI and the product cannot function |
| **Privacy by Architecture** | No persistent user data. Session-based. Documents processed in-memory and discarded |
| **Inclusion by Default** | Every design decision optimizes for the least digitally literate user |
| **Graceful Degradation** | If any AI service fails, the system falls back to the next best option without breaking |
| **API-First Backend** | Backend exposes clean REST APIs enabling future WhatsApp, IVRS, and mobile app integrations |
| **Modular & Extensible** | New schemes, languages, and document types can be added without code changes |

---

## 2. High-Level Architecture

### 2.1 Architecture Diagram

```text
┌──────────────────────────────────────────────────────────────────────┐
│ CLIENT LAYER                                                         │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐  │
│ │ REACT WEB APPLICATION                                           │  │
│ │                                                                 │  │
│ │ ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐   │  │
│ │ │ Language   │ │ Chat         │ │ Document   │ │ Scheme     │   │  │
│ │ │ Selector   │ │ Interface    │ │ Upload     │ │ Results    │   │  │
│ │ │ Component  │ │ Component    │ │ Component  │ │ Component  │   │  │
│ │ └────────────┘ └──────────────┘ └────────────┘ └────────────┘   │  │
│ │ ┌────────────┐ ┌──────────────┐ ┌────────────┐ ┌────────────┐   │  │
│ │ │ Voice      │ │ Profile      │ │ Document   │ │ Scheme     │   │  │
│ │ │ Recorder   │ │ Summary      │ │ Readiness  │ │ Comparison │   │  │
│ │ │ Component  │ │ Component    │ │ Component  │ │ Component  │   │  │
│ │ └────────────┘ └──────────────┘ └────────────┘ └────────────┘   │  │
│ │                                                                 │  │
│ │ ┌──────────────────────────────────────────────────────────────┐ │  │
│ │ │ STATE MANAGEMENT (Context API / Zustand)                     │ │  │
│ │ │ ├── userProfile          ├── chatHistory                     │ │  │
│ │ │ ├── selectedLanguage     ├── matchedSchemes                  │ │  │
│ │ │ ├── uploadedDocuments    ├── documentReadiness               │ │  │
│ │ │ └── sessionId            └── uiState                         │ │  │
│ │ └──────────────────────────────────────────────────────────────┘ │  │
│ └─────────────────────────────────────────────────────────────────┘  │
│                   │ HTTPS (REST API)                                 │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│ API GATEWAY LAYER                                                    │
│                                                                      │
│ ┌─────────────────────────────────────────────────────────────────┐  │
│ │ FASTAPI APPLICATION                                             │  │
│ │                                                                 │  │
│ │ ┌──────────────────────────────────────────────────────────┐    │  │
│ │ │ API ENDPOINTS                                            │    │  │
│ │ │                                                          │    │  │
│ │ │ POST /api/chat — Conversational interaction              │    │  │
│ │ │ POST /api/document/upload — Document OCR & extraction    │    │  │
│ │ │ POST /api/schemes/match — Scheme matching                │    │  │
│ │ │ GET  /api/schemes/{id} — Scheme details                  │    │  │
│ │ │ POST /api/schemes/compare — Scheme comparison            │    │  │
│ │ │ POST /api/voice/transcribe — Speech-to-text              │    │  │
│ │ │ POST /api/voice/synthesize — Text-to-speech              │    │  │
│ │ │ GET  /api/languages — Supported languages                │    │  │
│ │ │ POST /api/document/readiness— Document readiness check   │    │  │
│ │ │ GET  /api/health — Health check                          │    │  │
│ │ └──────────────────────────────────────────────────────────┘    │  │
│ │                                                                 │  │
│ │ ┌──────────────┐ ┌──────────────┐ ┌───────────────────────┐     │  │
│ │ │ CORS         │ │ Rate Limiter │ │ Request Validator     │     │  │
│ │ │ Middleware   │ │ Middleware   │ │ Middleware            │     │  │
│ │ └──────────────┘ └──────────────┘ └───────────────────────┘     │  │
│ └─────────────────────────────────────────────────────────────────┘  │
│                               │                                      │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
┌──────────────────────────────▼───────────────────────────────────────┐
│ CORE AI ENGINE LAYER                                                 │
│                                                                      │
│ ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐     │
│ │ CONVERSATION      │ │ DOCUMENT          │ │ SCHEME           │     │
│ │ ENGINE            │ │ INTELLIGENCE      │ │ MATCHING         │     │
│ │                   │ │ ENGINE            │ │ ENGINE           │     │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │ │ ┌──────────────┐ │     │
│ │ │ LLM           │ │ │ │ OCR Processor │ │ │ │ Rule-Based   │ │     │
│ │ │ Orchestrator  │ │ │ │ (Amazon      │ │ │ │ Filter       │ │     │
│ │ │               │ │ │ │  Textract)   │ │ │ │              │ │     │
│ │ └───────────────┘ │ │ └───────────────┘ │ │ └──────────────┘ │     │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │ │ ┌──────────────┐ │     │
│ │ │ Profile       │ │ │ │ LLM Data      │ │ │ │ LLM Scoring  │ │     │
│ │ │ Extractor     │ │ │ │ Parser        │ │ │ │ & Ranking    │ │     │
│ │ │               │ │ │ │               │ │ │ │              │ │     │
│ │ └───────────────┘ │ │ └───────────────┘ │ │ └──────────────┘ │     │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │ │ ┌──────────────┐ │     │
│ │ │ Context       │ │ │ │ Document      │ │ │ │ LLM          │ │     │
│ │ │ Manager       │ │ │ │ Classifier    │ │ │ │ Ranker &     │ │     │
│ │ │               │ │ │ │               │ │ │ │ Recommender  │ │     │
│ │ └───────────────┘ │ │ └───────────────┘ │ │ └──────────────┘ │     │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │ │ ┌──────────────┐ │     │
│ │ │ Translation   │ │ │ │ Privacy       │ │ │ │ Document     │ │     │
│ │ │ Service       │ │ │ │ Masker        │ │ │ │ Readiness    │ │     │
│ │ │ (In-built)    │ │ │ │               │ │ │ │ Scorer       │ │     │
│ │ └───────────────┘ │ │ └───────────────┘ │ │ └──────────────┘ │     │
│ └───────────────────┘ └───────────────────┘ └──────────────────┘     │
│                                                                      │
│ ┌───────────────────┐ ┌───────────────────┐                          │
│ │ VOICE ENGINE      │ │ COMPARISON        │                          │
│ │                   │ │ ENGINE            │                          │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │                          │
│ │ │ Amazon Polly  │ │ │ │ Multi-Scheme    │ │                          │
│ │ │ (TTS)        │ │ │ │ Comparator      │ │                          │
│ │ └───────────────┘ │ │ └───────────────┘ │                          │
│ │ ┌───────────────┐ │ │ ┌───────────────┐ │                          │
│ │ │ Amazon S3    │ │ │ │ Priority        │ │                          │
│ │ │ (Storage)    │ │ │ │ Recommender     │ │                          │
│ │ └───────────────┘ │ │ └───────────────┘ │                          │
│ └───────────────────┘ └───────────────────┘                          │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│ DATA LAYER                                                           │
│                                                                      │
│ ┌───────────────────┐ ┌───────────────────┐ ┌──────────────────┐     │
│ │ SCHEME DATABASE   │ │ VECTOR STORE      │ │ SESSION STORE    │     │
│ │                   │ │                   │ │                  │     │
│ │ JSON files +      │ │ ChromaDB          │ │ In-memory        │     │
│ │ SQLite            │ │                   │ │ (Redis optional) │     │
│ │                   │ │ Scheme embeddings │ │                  │     │
│ │ 30+ schemes with  │ │ using sentence-    │ │ User profile     │     │
│ │ full eligibility  │ │ transformers      │ │ Chat history     │     │
│ │ data, documents,  │ │                   │ │ Matched schemes  │     │
│ │ application steps │ │ Enables semantic  │ │ Uploaded docs    │     │
│ │                   │ │ search queries    │ │                  │     │
│ └───────────────────┘ └───────────────────┘ └──────────────────┘     │
│                                                                      │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────────┐
│ EXTERNAL SERVICES                                                    │
│                                                                      │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐   │
│ │ OpenAI API   │ │ Bhashini API │ │ Tesseract /  │ │ Google      │   │
│ │ GPT-4o-mini  │ │ (Translation │ │ Google Cloud │ │ Cloud STT   │   │
│ │ (LLM)        │ │ + TTS)       │ │ Vision (OCR) │ │ (Fallback)  │   │
│ └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘   │
│ ┌──────────────┐ ┌──────────────┐                                    │
│ │ OpenAI       │ │ Sentence     │                                    │
│ │ Whisper      │ │ Transformers │                                    │
│ │ (STT)        │ │ (Embeddings) │                                    │
│ └──────────────┘ └──────────────┘                                    │
└──────────────────────────────────────────────────────────────────────┘
```



### 2.2 Architecture Pattern
- **Frontend:** React SPA (Single Page Application) with component-based architecture
- **Backend:** Python FastAPI with modular service layer
- **AI Layer:** Multi-engine AI with OCR (Amazon Textract), LLM (NVIDIA NIM), and Speech processing (Amazon Polly)
- **Communication:** REST API over HTTPS with JSON payloads
- **State Management:** Client-side state (Zustand) + server-side session (Amazon DynamoDB)

---

## 3. Frontend Design (React Application)

### 3.1 Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| React Router | 7.x | Client-side routing |
| Zustand | 5.x | State management (single unified store) |
| Vanilla CSS | — | Custom styling |
| Axios | 1.x | HTTP client for API calls |
| Lucide React | 0.x | Icon library |
| Framer Motion | 12.x | Smooth animations and transitions |

### 3.2 Project Structure
```text
jan-sahayak-frontend/
├── public/
│ ├── index.html
│ ├── favicon.ico
│ ├── manifest.json
│ └── locales/
│ ├── en/
│ │ └── translation.json
│ ├── hi/
│ │ └── translation.json
│ ├── ta/
│ │ └── translation.json
│ └── te/
│ └── translation.json
├── src/
│ ├── main.jsx
│ ├── App.jsx
│ ├── index.css
│ │
│ ├── components/
│ │ ├── layout/
│ │ │ ├── Header.jsx
│ │ │ ├── Footer.jsx
│ │ │ ├── MobileNav.jsx
│ │ │ └── Layout.jsx
│ │ │
│ │ ├── onboarding/
│ │ │ ├── WelcomeScreen.jsx
│ │ │ ├── LanguageSelector.jsx
│ │ │ └── OnboardingFlow.jsx
│ │ │
│ │ ├── chat/
│ │ │ ├── ChatContainer.jsx
│ │ │ ├── ChatMessage.jsx
│ │ │ ├── ChatInput.jsx
│ │ │ ├── VoiceRecorder.jsx
│ │ │ ├── TypingIndicator.jsx
│ │ │ └── QuickActions.jsx
│ │ │
│ │ ├── document/
│ │ │ ├── DocumentUpload.jsx
│ │ │ ├── DocumentPreview.jsx
│ │ │ ├── DocumentProcessing.jsx
│ │ │ ├── ExtractedDataConfirm.jsx
│ │ │ └── DocumentReadinessCard.jsx
│ │ │
│ │ ├── schemes/
│ │ │ ├── SchemeList.jsx
│ │ │ ├── SchemeCard.jsx
│ │ │ ├── SchemeDetail.jsx
│ │ │ ├── SchemeComparison.jsx
│ │ │ ├── EligibilityBadge.jsx
│ │ │ ├── DocumentChecklist.jsx
│ │ │ └── ApplicationSteps.jsx
│ │ │
│ │ ├── profile/
│ │ │ ├── ProfileSummary.jsx
│ │ │ ├── ProfileEditor.jsx
│ │ │ └── ProfileConfirmation.jsx
│ │ │
│ │ └── common/
│ │ ├── Button.jsx
│ │ ├── Card.jsx
│ │ ├── Modal.jsx
│ │ ├── Loader.jsx
│ │ ├── ProgressBar.jsx
│ │ ├── Badge.jsx
│ │ ├── ErrorBoundary.jsx
│ │ └── AccessibleIcon.jsx
│ │
│ ├── pages/
│ │ ├── HomePage.jsx
│ │ ├── ChatPage.jsx
│ │ ├── SchemesPage.jsx
│ │ ├── SchemeDetailPage.jsx
│ │ ├── ComparePage.jsx
│ │ └── AboutPage.jsx
│ │
│ ├── store/
│ │ ├── useAppStore.js — Global app state
│ │ ├── useChatStore.js — Chat history and context
│ │ ├── useProfileStore.js — User profile data
│ │ ├── useSchemeStore.js — Matched schemes data
│ │ └── useDocumentStore.js — Uploaded documents data
│ │
│ ├── services/
│ │ ├── api.js — Axios instance with base config
│ │ ├── chatService.js — Chat API calls
│ │ ├── documentService.js — Document upload API calls
│ │ ├── schemeService.js — Scheme matching API calls
│ │ ├── voiceService.js — Voice transcription API calls
│ │ └── languageService.js — Language/translation API calls
│ │
│ ├── hooks/
│ │ ├── useVoiceRecorder.js — Custom hook for voice recording
│ │ ├── useDocumentUpload.js — Custom hook for document upload
│ │ ├── useSchemeMatching.js — Custom hook for scheme matching
│ │ ├── useLanguage.js — Custom hook for i18n
│ │ └── useMediaQuery.js — Responsive breakpoint hook
│ │
│ ├── utils/
│ │ ├── constants.js — App-wide constants
│ │ ├── helpers.js — Utility functions
│ │ ├── formatters.js — Data formatting functions
│ │ └── validators.js — Input validation functions
│ │
│ ├── i18n/
│ │ └── i18n.js — i18next configuration
│ │
│ └── assets/
│ ├── images/
│ ├── icons/
│ └── sounds/
│
├── .env
├── .env.example
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```


### 3.3 Component Design


#### 3.3.1 WelcomeScreen Component
```text
┌──────────────────────────────────┐
│        🇮🇳 Jan Sahayak            │
│           जन सहायक              │
│                                  │
│   "Your AI Rights Enablement     │
│          Assistant"              │
│                                  │
│   ┌─────────────────────────┐    │
│   │ 🗣️ अपनी भाषा चुनें         │    │
│   │  Select your language   │    │
│   │                         │    │
│   │  [हिंदी]   [English]      │    │
│   │  [தமிழ்]   [తెలుగు]     │    │
│   │  [मराठी]   [বাংলা]        │    │
│   │  [ಕನ್ನಡ]   [ગુજરાતી]     │    │
│   │  [മലയാളം]  [ਪੰਜਾਬੀ]    │    │
│   │  [ଓଡ଼ିଆ]                 │    │
│   └─────────────────────────┘    │
│                                  │
│          ── OR ──                │
│                                  │
│   ┌─────────────────────────┐    │
│   │ 🎤 Tap & speak in your  │    │
│   │      language           │    │
│   └─────────────────────────┘    │
│                                  │
│  Powered by AI | Privacy First   │
└──────────────────────────────────┘
```



**Props:**
```jsx
WelcomeScreen({
  onLanguageSelect: (languageCode) => void,
  onVoiceStart: () => void,
  supportedLanguages: Language[]
})

#### 3.3.2 ChatContainer Component

```text
┌──────────────────────────────────┐
│  🇮🇳 Jan Sahayak    [हिं] [📷]  │
├──────────────────────────────────┤
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🤖 नमस्ते! मैं जन सहायक    │    │
│  │ हूं। मैं आपको सरकारी        │    │
│  │ योजनाओं की जानकारी        │    │
│  │ दूंगा। आपकी उम्र कितनी      │    │
│  │ है?                       │    │
│  └──────────────────────────┘    │
│                                  │
│      ┌──────────────────────┐    │
│      │ मैं 45 साल का किसान   │     │
│      │ हूं, MP से            │ 👤  │
│      └──────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ 🤖 अच्छा! आपके परिवार     │    │
│  │ में कितने लोग हैं और         │    │
│  │ सालाना आय कितनी है?       │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Quick Actions:           │    │
│  │ [📷 Upload Doc]          │    │
│  │ [🔍 Find Schemes]        │    │
│  │ [📊 Compare Schemes]     │    │
│  └──────────────────────────┘    │
│                                  │
├──────────────────────────────────┤
│  ┌──────────────────────┐ [🎤]   │
│  │ Type your message...  │ [📎]  │
│  └──────────────────────┘ [➤]    │
└──────────────────────────────────┘
```
#### 3.3.3 SchemeCard Component

```text
┌──────────────────────────────────┐
│  ✅ PM-KISAN Samman Nidhi        │
│  पीएम-किसान सम्मान निधि             │
│                                   │
│  💰 ₹6,000/year                  │
│  📋 Cash Transfer | Agriculture  │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Eligibility Match: 95%   │    │
│  │ ████████████████░░ 95%   │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌──────────────────────────┐    │
│  │ Document Readiness: 3/5  │    │
│  │ ████████████░░░░░░ 60%   │    │
│  └──────────────────────────┘    │
│                                  │
│  ┌────────────┐ ┌──────────────┐ │
│  │ View Details│ │ Compare ☐   │ │
│  └────────────┘ └──────────────┘ │
└──────────────────────────────────┘
```

Props:

React

SchemeCard({
  scheme: {
    id: string,
    name_en: string,
    name_local: string,
    benefit_amount: string,
    benefit_type: string,
    category: string,
    eligibility_score: number,      // 0-100
    document_readiness: {
      ready: number,
      total: number,
      percentage: number
    }
  },
  onViewDetails: (schemeId) => void,
  onCompareToggle: (schemeId) => void,
  isCompareSelected: boolean,
  language: string
})

#### 3.3.4 DocumentReadinessCard Component

```text
┌──────────────────────────────────────┐
│  📋 Document Readiness — PM-KISAN    │
│     Score: 3/5 (60%)                 │
│     ████████████░░░░░░░░ 60%         │
│                                      │
│  ✅ Aadhaar Card                     │
│     Status: Available (uploaded)     │
│                                      │
│  ✅ Bank Account Details             │
│     Status: Available (from chat)    │
│                                      │
│  ✅ Mobile Number                    │
│     Status: Available                │
│                                      │
│  ❌ Land Ownership Record            │
│     📍 Where: Local Patwari Office   │
│     ⏱️ Time: 3-7 working days        │
│     💡 Tip: Carry Aadhaar & old      │
│        land documents                │
│                                      │
│  ❌ Income Certificate               │
│     📍 Where: District Collectorate  │
│        or CSC Center                 │
│     ⏱️ Time: 7-15 working days      │
│     💡 Tip: Can also apply online   │
│        via state e-District portal   │
│                                       │   
│  ┌────────────────────────────────┐  │
│  │ 🚀 Start Application Process   │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```


#### 3.3.5 SchemeComparison Component

```text
┌────────────────────────────────────────────────────────┐
│  📊 Scheme Comparison                                   │
│                                                         │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │  PM-KISAN     │  PM Fasal    │  Kisan       │        │
│  │              │  Bima        │  Credit Card │        │
│  ├──────────────┼──────────────┼──────────────┤        │
│  │ 💰 ₹6,000/yr │ 💰 Insurance │ 💰 ₹3L loan  │        │
│  ├──────────────┼──────────────┼──────────────┤        │
│  │ 📋 3/5 docs  │ 📋 2/5 docs  │ 📋 3/6 docs  │        │
│  ├──────────────┼──────────────┼──────────────┤        │
│  │ ⏱️ ~2 weeks  │ ⏱️ Seasonal  │ ⏱️ ~3 weeks  │        │
│  ├──────────────┼──────────────┼──────────────┤        │
│  │ ⭐ 95%       │ ⭐ 88%       │ ⭐ 82%       │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                         │
│  🤖 AI Recommendation:                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │ "Ramesh ji, PM-KISAN ke liye pehle apply karein │   │
│  │  kyunki aapke paas zyada documents ready hain   │   │
│  │  aur ₹6,000 seedha bank mein aayenge. Uske      │   │
│  │  baad Kisan Credit Card ke liye apply karein     │   │
│  │  — agla season planning ke liye useful hoga."    │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
```

3.4 Application Routes
```
React

const routes = [
  {
    path: "/",
    component: HomePage,          // Welcome + Language selection
    description: "Landing page with language selection"
  },
  {
    path: "/chat",
    component: ChatPage,          // Main chat interface
    description: "Conversational AI interface"
  },
  {
    path: "/schemes",
    component: SchemesPage,       // Matched schemes list
    description: "List of matched schemes with filters"
  },
  {
    path: "/schemes/:id",
    component: SchemeDetailPage,  // Detailed scheme view
    description: "Full scheme details with document checklist"
  },
  {
    path: "/compare",
    component: ComparePage,       // Side-by-side comparison
    description: "Compare selected schemes"
  },
  {
    path: "/about",
    component: AboutPage,         // About Jan Sahayak
    description: "About the project and team"
  }
];
3.5 State Management Design (Zustand)
JavaScript

// useAppStore.js — Global Application State
const useAppStore = create((set, get) => ({
  // Language
  selectedLanguage: null,        // 'hi', 'en', 'ta', etc.
  setLanguage: (lang) => set({ selectedLanguage: lang }),

  // Session
  sessionId: generateUUID(),
  resetSession: () => set({ 
    sessionId: generateUUID(),
    // Reset all other stores
  }),

  // UI State
  isLoading: false,
  activeView: 'welcome',        // 'welcome', 'chat', 'schemes', 'compare'
  setActiveView: (view) => set({ activeView: view }),

  // Error State
  error: null,
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),
}));

// useProfileStore.js — User Profile State
const useProfileStore = create((set, get) => ({
  profile: {
    name: null,
    age: null,
    gender: null,
    state: null,
    district: null,
    occupation: null,
    annual_income: null,
    category: null,              // SC, ST, OBC, General
    education: null,
    family_size: null,
    land_holding_hectares: null,
    has_bank_account: null,
    has_aadhaar: null,
    is_bpl: null,
    marital_status: null,
  },
  profileCompleteness: 0,       // 0-100%
  isProfileConfirmed: false,

  updateProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates },
    profileCompleteness: calculateCompleteness({ ...state.profile, ...updates })
  })),

  confirmProfile: () => set({ isProfileConfirmed: true }),
  resetProfile: () => set({ profile: {}, profileCompleteness: 0, isProfileConfirmed: false }),
}));

// useChatStore.js — Chat State
const useChatStore = create((set, get) => ({
  messages: [],
  isAiTyping: false,
  conversationPhase: 'greeting',  // 'greeting', 'profiling', 'matching', 'exploring', 'comparing'

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      id: generateUUID(),
      ...message,
      timestamp: new Date().toISOString()
    }]
  })),

  setAiTyping: (typing) => set({ isAiTyping: typing }),
  setPhase: (phase) => set({ conversationPhase: phase }),
  clearChat: () => set({ messages: [], conversationPhase: 'greeting' }),
}));

// useSchemeStore.js — Scheme Results State
const useSchemeStore = create((set, get) => ({
  matchedSchemes: [],
  selectedSchemeId: null,
  compareList: [],               // scheme IDs selected for comparison
  comparisonResult: null,

  setMatchedSchemes: (schemes) => set({ matchedSchemes: schemes }),
  selectScheme: (id) => set({ selectedSchemeId: id }),

  toggleCompare: (id) => set((state) => {
    const exists = state.compareList.includes(id);
    return {
      compareList: exists 
        ? state.compareList.filter(s => s !== id)
        : state.compareList.length < 3 
          ? [...state.compareList, id]
          : state.compareList  // Max 3 schemes for comparison
    };
  }),

  setComparisonResult: (result) => set({ comparisonResult: result }),
  clearSchemes: () => set({ matchedSchemes: [], compareList: [], comparisonResult: null }),
}));

// useDocumentStore.js — Document State
const useDocumentStore = create((set, get) => ({
  uploadedDocuments: [],         // [{type, extractedData, status}]
  documentReadiness: {},         // {schemeId: {ready: 3, total: 5, details: [...]}}

  addDocument: (doc) => set((state) => ({
    uploadedDocuments: [...state.uploadedDocuments, doc]
  })),

  setDocumentReadiness: (schemeId, readiness) => set((state) => ({
    documentReadiness: { ...state.documentReadiness, [schemeId]: readiness }
  })),

  removeDocument: (docId) => set((state) => ({
    uploadedDocuments: state.uploadedDocuments.filter(d => d.id !== docId)
  })),

  clearDocuments: () => set({ uploadedDocuments: [], documentReadiness: {} }),
}));
```
### 4. Backend Design (Python FastAPI)
#### 4.1 Technology Stack

Technology	Version	Purpose
Python	3.11+	Backend language
FastAPI	0.104+	Web framework with async support
Gunicorn	22.x	Production WSGI/ASGI server
Uvicorn	0.24+	ASGI worker for Gunicorn
NVIDIA NIM API	—	Llama 3.3 70B access (Free tier)
httpx	0.25+	Async HTTP client for LLM API calls
Pillow	10.x	Image processing
boto3	1.x	AWS Services (Textract, Polly, S3, DynamoDB)
pydantic	2.x	Data validation and serialization
python-multipart	0.x	File upload handling
python-dotenv	1.x	Environment variable management
Mangum	0.x	AWS Lambda adapter for serverless deployment
### 4.2 Project Structure
```
jan-sahayak-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                     — FastAPI app initialization
│   ├── config.py                   — Configuration and env variables
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py             — Chat endpoints
│   │   │   ├── document.py         — Document upload & OCR endpoints
│   │   │   ├── schemes.py          — Scheme matching & details endpoints
│   │   │   ├── voice.py            — Voice STT/TTS endpoints
│   │   │   └── health.py           — Health check endpoint
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── requests.py         — Pydantic request models
│   │   │   ├── responses.py        — Pydantic response models
│   │   │   └── schemas.py          — Shared data schemas
│   │   │
│   │   └── middleware/
│   │       ├── __init__.py
│   │       ├── cors.py             — CORS configuration
│   │       ├── rate_limiter.py     — Rate limiting
│   │       └── error_handler.py    — Global error handling
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── conversation_engine.py  — LLM orchestration & profile extraction
│   │   ├── document_engine.py      — OCR + LLM document intelligence
│   │   ├── scheme_matcher.py       — RAG + rule-based scheme matching
│   │   ├── document_readiness.py   — Document readiness scoring
│   │   ├── scheme_comparator.py    — Scheme comparison & recommendation
│   │   ├── translation_service.py  — Bhashini/translation integration
│   │   ├── voice_service.py        — STT and TTS processing
│   │   └── privacy_manager.py      — Data masking and privacy utilities
│   │
│   ├── data/
│   │   ├── __init__.py
│   │   ├── scheme_loader.py        — Load schemes from JSON
│   │   ├── vector_store.py         — ChromaDB vector store management
│   │   ├── session_store.py        — In-memory session management
│   │   └── schemes/
│   │       ├── agriculture.json
│   │       ├── health.json
│   │       ├── education.json
│   │       ├── housing.json
│   │       ├── financial.json
│   │       ├── social_security.json
│   │       ├── women_child.json
│   │       └── employment.json
│   │
│   ├── prompts/
│   │   ├── __init__.py
│   │   ├── conversation.py         — LLM prompts for conversation
│   │   ├── profile_extraction.py   — LLM prompts for profile extraction
│   │   ├── document_parsing.py     — LLM prompts for document OCR parsing
│   │   ├── scheme_matching.py      — LLM prompts for scheme recommendation
│   │   └── comparison.py           — LLM prompts for scheme comparison
│   │
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py              — General utility functions
│       ├── validators.py           — Input validation
│       └── constants.py            — Application constants
│
├── tests/
│   ├── __init__.py
│   ├── test_chat.py
│   ├── test_document.py
│   ├── test_scheme_matcher.py
│   └── test_api.py
│
├── .env
├── .env.example
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
4.3 API Endpoint Design
4.3.1 POST /api/chat — Conversational Interaction
Request:

JSON

{
  "session_id": "uuid-string",
  "message": "Main 45 saal ka kisan hoon, MP se",
  "language": "hi",
  "chat_history": [
    {
      "role": "assistant",
      "content": "Namaste! Aapki umar kitni hai?"
    },
    {
      "role": "user",
      "content": "Main 45 saal ka kisan hoon, MP se"
    }
  ],
  "current_profile": {
    "age": null,
    "occupation": null
  }
}
Response:

JSON

{
  "status": "success",
  "response": {
    "message": "Bahut achha Ramesh ji! Aap MP ke kisan hain. Aapke parivaar mein kitne log hain aur saalana income lagbhag kitni hai?",
    "extracted_profile_updates": {
      "age": 45,
      "occupation": "farmer",
      "state": "Madhya Pradesh"
    },
    "conversation_phase": "profiling",
    "profile_completeness": 35,
    "suggested_actions": [
      {
        "type": "continue_chat",
        "label": "Answer questions"
      },
      {
        "type": "upload_document",
        "label": "Upload Aadhaar to auto-fill"
      }
    ],
    "is_profile_complete": false
  }
}
```
### 4.3.2 POST /api/document/upload — Document Intelligence
```
Request:

text

Content-Type: multipart/form-data

Fields:
- file: (binary image file — JPEG/PNG/PDF)
- session_id: "uuid-string"
- language: "hi"
- document_type_hint: "aadhaar" | "ration_card" | "auto_detect" (optional)
Response:

JSON

{
  "status": "success",
  "response": {
    "detected_document_type": "aadhaar_card",
    "confidence": 0.94,
    "extracted_data": {
      "name": "Ramesh Kumar",
      "date_of_birth": "1979-03-15",
      "age": 45,
      "gender": "male",
      "address": {
        "state": "Madhya Pradesh",
        "district": "Sagar",
        "full_address": "Village Rahatgarh, Sagar, MP 470002"
      },
      "aadhaar_number_masked": "XXXX-XXXX-4523"
    },
    "profile_updates": {
      "name": "Ramesh Kumar",
      "age": 45,
      "gender": "male",
      "state": "Madhya Pradesh",
      "district": "Sagar"
    },
    "ocr_quality": "good",
    "message": "Aapke Aadhaar card se yeh jaankari mili. Kya yeh sahi hai?",
    "requires_confirmation": true
  }
}
4.3.3 POST /api/schemes/match — Scheme Matching
Request:

JSON

{
  "session_id": "uuid-string",
  "profile": {
    "age": 45,
    "gender": "male",
    "state": "Madhya Pradesh",
    "district": "Sagar",
    "occupation": "farmer",
    "annual_income": 150000,
    "category": "OBC",
    "family_size": 5,
    "land_holding_hectares": 0.6,
    "has_bank_account": true,
    "has_aadhaar": true,
    "is_bpl": false,
    "education": "10th_pass"
  },
  "query": "farming ke liye koi scheme hai kya?",
  "language": "hi",
  "uploaded_documents": ["aadhaar_card"],
  "max_results": 10
}
Response:

JSON

{
  "status": "success",
  "response": {
    "total_matches": 7,
    "schemes": [
      {
        "scheme_id": "PM_KISAN_001",
        "name_en": "PM-KISAN Samman Nidhi",
        "name_local": "पीएम-किसान सम्मान निधि",
        "benefit_amount": "₹6,000/year",
        "benefit_type": "cash_transfer",
        "category": "agriculture",
        "eligibility_score": 95,
        "eligibility_reasoning": "Age, occupation, land holding, and state all match. OBC category is eligible.",
        "document_readiness": {
          "ready": 3,
          "total": 5,
          "percentage": 60,
          "documents": [
            {"name": "Aadhaar Card", "status": "available", "source": "uploaded"},
            {"name": "Bank Account", "status": "available", "source": "profile"},
            {"name": "Mobile Number", "status": "available", "source": "profile"},
            {"name": "Land Record", "status": "missing", "where_to_get": "Patwari Office", "time": "3-7 days"},
            {"name": "Income Certificate", "status": "missing", "where_to_get": "Collectorate/CSC", "time": "7-15 days"}
          ]
        }
      }
      // ... more schemes
    ],
    "ai_summary": "Ramesh ji, aapke profile ke hisaab se 7 sarkari yojanaon ke liye eligible hain. Sabse pehle PM-KISAN ke liye apply karein — ₹6,000 har saal seedha aapke bank account mein aayenge.",
    "recommended_order": ["PM_KISAN_001", "KCC_001", "PM_FASAL_BIMA_001"]
  }
}
```
### 4.3.4 POST /api/schemes/compare — Scheme Comparison
```
Request:

JSON

{
  "session_id": "uuid-string",
  "scheme_ids": ["PM_KISAN_001", "PM_FASAL_BIMA_001", "KCC_001"],
  "profile": { /* user profile */ },
  "language": "hi"
}
Response:

JSON

{
  "status": "success",
  "response": {
    "comparison": [
      {
        "scheme_id": "PM_KISAN_001",
        "name_local": "पीएम-किसान सम्मान निधि",
        "benefit_amount": "₹6,000/year",
        "benefit_type": "Direct cash transfer",
        "eligibility_score": 95,
        "document_readiness_percentage": 60,
        "application_complexity": "easy",
        "estimated_time_to_benefit": "2-4 weeks",
        "priority_rank": 1
      },
      {
        "scheme_id": "KCC_001",
        "name_local": "किसान क्रेडिट कार्ड",
        "benefit_amount": "Up to ₹3 lakh loan",
        "benefit_type": "Low-interest loan",
        "eligibility_score": 82,
        "document_readiness_percentage": 50,
        "application_complexity": "medium",
        "estimated_time_to_benefit": "3-5 weeks",
        "priority_rank": 2
      },
      {
        "scheme_id": "PM_FASAL_BIMA_001",
        "name_local": "पीएम फसल बीमा योजना",
        "benefit_amount": "Crop insurance",
        "benefit_type": "Insurance coverage",
        "eligibility_score": 88,
        "document_readiness_percentage": 40,
        "application_complexity": "medium",
        "estimated_time_to_benefit": "Seasonal enrollment",
        "priority_rank": 3
      }
    ],
    "ai_recommendation": "Ramesh ji, PM-KISAN ke liye sabse pehle apply karein kyunki:\n1. Aapke paas zyada documents ready hain (3/5)\n2. Direct cash benefit hai — ₹6,000 har saal\n3. Application process sabse simple hai\n\nUske baad Kisan Credit Card ke liye apply karein — agla season planning ke liye loan mil jayega.\n\nPM Fasal Bima seasonal hai, toh kharif season se pehle apply karein.",
    "comparison_summary": {
      "best_immediate_benefit": "PM_KISAN_001",
      "best_long_term_value": "KCC_001",
      "easiest_to_apply": "PM_KISAN_001"
    }
  }
}
```
## 4.3.5 GET /api/schemes/{scheme_id} — Scheme Details
```
Response:

JSON

{
  "status": "success",
  "response": {
    "scheme_id": "PM_KISAN_001",
    "name_en": "PM-KISAN Samman Nidhi",
    "name_local": "पीएम-किसान सम्मान निधि",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "description_local": "इस योजना के तहत छोटे और सीमांत किसानों को हर साल ₹6,000 की आर्थिक सहायता दी जाती है। यह राशि ₹2,000 की तीन किस्तों में सीधे बैंक खाते में भेजी जाती है।",
    "eligibility": {
      "summary_local": "सभी छोटे और सीमांत किसान (2 हेक्टेयर तक ज़मीन)",
      "criteria": [
        "भारतीय नागरिक होना चाहिए",
        "खेती योग्य भूमि होनी चाहिए",
        "2 हेक्टेयर (5 एकड़) तक ज़मीन",
        "सभी जाति वर्ग पात्र",
        "सभी राज्यों में उपलब्ध"
      ]
    },
    "benefits": {
      "amount": "₹6,000 per year",
      "frequency": "3 installments of ₹2,000 each",
      "type": "Direct Bank Transfer",
      "details_local": "हर 4 महीने में ₹2,000 सीधे बैंक खाते में"
    },
    "documents_required": [
      {
        "name": "Aadhaar Card",
        "name_local": "आधार कार्ड",
        "is_mandatory": true,
        "user_has": true,
        "source": "uploaded"
      },
      {
        "name": "Land Ownership Record",
        "name_local": "भूमि स्वामित्व रिकॉर्ड (खसरा/खतौनी)",
        "is_mandatory": true,
        "user_has": false,
        "where_to_obtain": "पटवारी कार्यालय / तहसील कार्यालय",
        "estimated_time": "3-7 कार्य दिवस",
        "tips": "पुराने ज़मीन के कागज़ साथ ले जाएं"
      }
      // ... more documents
    ],
    "application_process": {
      "online": {
        "portal": "https://pmkisan.gov.in",
        "steps_local": [
          "pmkisan.gov.in पर जाएं",
          "New Farmer Registration पर क्लिक करें",
          "आधार नंबर और मोबाइल नंबर दर्ज करें",
          "ज़मीन की जानकारी भरें",
          "बैंक खाते की जानकारी दें",
          "Submit करें — राज्य सरकार वेरीफाई करेगी"
        ]
      },
      "offline": {
        "office": "नज़दीकी CSC (जन सेवा केंद्र) या कृषि कार्यालय",
        "steps_local": [
          "CSC या कृषि कार्यालय जाएं",
          "PM-KISAN फॉर्म भरें",
          "आधार, बैंक पासबुक, ज़मीन के कागज़ की कॉपी दें",
          "रसीद ज़रूर लें"
        ]
      }
    },
    "helpline": "155261 / 011-24300606",
    "official_url": "https://pmkisan.gov.in"
  }
}
```
### 4.3.6 POST /api/voice/transcribe — Speech to Text
```
Request:

text

Content-Type: multipart/form-data
Fields:
- audio: (binary audio file — WAV/MP3/WEBM)
- session_id: "uuid-string"
- language_hint: "hi" (optional)
Response:

JSON

{
  "status": "success",
  "response": {
    "transcribed_text": "Main ek kisan hoon aur mujhe PM Kisan ke baare mein jaanna hai",
    "detected_language": "hi",
    "confidence": 0.92
  }
}
```
### 4.3.7 POST /api/voice/synthesize — Text to Speech
```
Request:

JSON

{
  "text": "Aap PM-KISAN ke liye eligible hain. Har saal ₹6,000 milenge.",
  "language": "hi",
  "speed": 1.0
}
Response:

text

Content-Type: audio/mpeg
Body: (binary MP3 audio data)
4.3.8 POST /api/document/readiness — Document Readiness Check
Request:

JSON

{
  "session_id": "uuid-string",
  "scheme_id": "PM_KISAN_001",
  "profile": { /* user profile */ },
  "uploaded_documents": ["aadhaar_card", "bank_passbook"],
  "mentioned_documents": ["mobile_number"]
}
Response:

JSON

{
  "status": "success",
  "response": {
    "scheme_id": "PM_KISAN_001",
    "scheme_name": "PM-KISAN Samman Nidhi",
    "readiness_score": {
      "ready": 3,
      "total": 5,
      "percentage": 60
    },
    "documents": [
      {
        "name": "Aadhaar Card",
        "status": "available",
        "source": "uploaded",
        "icon": "✅"
      },
      {
        "name": "Bank Account Details",
        "status": "available",
        "source": "uploaded",
        "icon": "✅"
      },
      {
        "name": "Mobile Number",
        "status": "available",
        "source": "mentioned_in_chat",
        "icon": "✅"
      },
      {
        "name": "Land Ownership Record",
        "status": "missing",
        "icon": "❌",
        "where_to_obtain": "Patwari Office / Tehsil Office",
        "estimated_time": "3-7 working days",
        "estimated_cost": "Free (may have nominal fee ₹10-50)",
        "tips": "Carry old land documents and Aadhaar",
        "alternatives": ["Khasra/Khatauni", "Land Patta", "7/12 Extract (Maharashtra)"]
      },
      {
        "name": "Income Certificate",
        "status": "missing",
        "icon": "❌",
        "where_to_obtain": "District Collectorate / CSC / e-District Portal",
        "estimated_time": "7-15 working days",
        "estimated_cost": "Free at CSC, ₹20-50 at Tehsil",
        "tips": "Can apply online through state e-District portal",
        "alternatives": ["Self-declaration (some states)", "BPL Card"]
      }
    ],
    "next_steps": "Get Land Record from Patwari first (faster), then Income Certificate from Collectorate.",
    "estimated_total_preparation_time": "2-3 weeks"
  }
}
```
### 5. Core AI Engine Design
### 5.1 Conversation Engine
#### 5.1.1 LLM Orchestration Flow
```
User Message (any language)
         │
         ▼
┌─────────────────────┐
│ Language Detection   │──── Detect input language
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Context Assembly     │──── Combine: system prompt + chat history + 
│                      │     current profile + conversation phase
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ LLM Call             │──── GPT-4o-mini with structured output
│ (OpenAI API)         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Response Parser      │──── Extract: response text + profile updates + 
│                      │     conversation phase + suggested actions
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Translation Layer    │──── Translate response to user's language 
│ (if needed)          │     (if LLM didn't respond in target language)
└─────────┬───────────┘
          │
          ▼
Response to User
```
### 5.1.2 System Prompt Design
```
SYSTEM_PROMPT = """
You are Jan Sahayak (जन सहायक), an AI assistant that helps Indian citizens 
discover government welfare schemes they are eligible for.

YOUR ROLE:
- You are warm, friendly, and speak simply
- You address users respectfully (use "ji", "aap")
- You ask ONE question at a time (never overwhelm)
- You understand Hindi, English, and Hinglish

YOUR TASK:
Phase 1 — PROFILING: Collect user profile through natural conversation.
  Required fields: age, gender, state, occupation, annual_income, category, family_size
  Optional fields: district, education, land_holding, bpl_status, marital_status
  
  Rules:
  - Ask maximum 5-7 questions
  - If user provides multiple data points in one response, acknowledge all
  - Accept approximate values ("income lagbhag 1-2 lakh" → annual_income: 150000)
  - If user says "pata nahi" for any field, mark as null and move on
  - After collecting enough data, summarize profile and ask for confirmation

Phase 2 — MATCHING: Once profile is confirmed, trigger scheme matching.
  - Present top schemes with brief descriptions
  - Highlight the most beneficial scheme first
  
Phase 3 — EXPLORING: Answer follow-up questions about specific schemes.
  - Use ONLY the provided scheme data — NEVER hallucinate scheme details
  - If you don't know something, say "Iske liye official helpline pe call karein: [number]"

Phase 4 — COMPARING: When user wants to compare schemes.
  - Compare based on: benefit amount, document readiness, application ease
  - Give clear recommendation with reasoning

CRITICAL RULES:
1. NEVER make up scheme eligibility criteria or benefit amounts
2. NEVER ask for Aadhaar number or any sensitive ID
3. ALWAYS respond in the user's language
4. ALWAYS be encouraging — "Aap eligible hain!" not "You may or may not qualify"
5. If unsure about eligibility, say "sambhavit" (possibly) eligible

OUTPUT FORMAT (JSON):
{
  "response_text": "Your response in user's language",
  "profile_updates": {"field": "value"} or null,
  "conversation_phase": "profiling|matching|exploring|comparing",
  "is_profile_complete": boolean,
  "trigger_scheme_matching": boolean,
  "suggested_actions": [{"type": "action_type", "label": "label"}]
}
"""
```
### 5.2 Document Intelligence Engine
#### 5.2.1 OCR + LLM Pipeline
```
Document Image (uploaded by user)
         │
         ▼
┌─────────────────────┐
│ Image Preprocessing  │
│ - Resize (if needed) │
│ - Deskew             │
│ - Contrast enhance   │
│ - Grayscale convert  │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ OCR Engine           │
│ (Tesseract or Cloud) │──── Extract raw text from image
│                      │     Configure for Hindi + English scripts
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Document Classifier  │
│ (LLM)               │──── Determine document type:
│                      │     aadhaar | ration_card | income_cert | other
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ LLM Data Extractor   │──── Parse OCR text into structured data
│                      │     based on document type
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Privacy Masker       │──── Mask Aadhaar: 1234-5678-9012 → XXXX-XXXX-9012
│                      │     Mask sensitive fields
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Profile Mapper       │──── Map extracted data to user profile fields
│                      │     Calculate DOB → age
│                      │     Parse address → state, district
└─────────┬───────────┘
          │
          ▼
Structured Profile Data + Confirmation Request
```
### 5.2.2 Document Parsing Prompt
```
DOCUMENT_PARSE_PROMPT = """
You are a document data extraction AI. You will receive raw OCR text 
extracted from an Indian government document.

DOCUMENT TYPE: {document_type}

RAW OCR TEXT:
{ocr_text}

TASK: Extract the following fields from the OCR text. 
If a field is not found, set it to null.

For AADHAAR CARD, extract:
- full_name: string
- date_of_birth: string (YYYY-MM-DD format)
- gender: "male" | "female" | "other"
- address: string (full address)
- state: string (Indian state name)
- district: string
- pincode: string
- aadhaar_number: string (12 digits — will be masked later)

For RATION CARD, extract:
- head_of_family: string
- card_type: "APL" | "BPL" | "AAY" | "PHH" | "NPHH"
- family_members_count: number
- address: string
- state: string
- district: string
- annual_income: number (if mentioned)

IMPORTANT:
- Handle OCR errors gracefully (common: 0↔O, 1↔I, S↔5)
- If text is in Hindi/Devanagari, still extract data correctly
- Return ONLY valid JSON, no explanation

OUTPUT FORMAT:
{
  "document_type": "aadhaar_card",
  "confidence": 0.85,
  "extracted_fields": { ... },
  "ocr_quality": "good" | "moderate" | "poor"
}
```
### 5.3 Scheme Matching Engine
#### 5.3.1 Three-Stage Matching Pipeline
```
User Profile + Optional Query
         │
         ▼
┌──────────────────────────────────────────────┐
│            STAGE 1: RULE-BASED FILTERING      │
│                                               │
│  For each scheme in database:                 │
│    ✓ Check age range (age_min ≤ user.age ≤ age_max)
│    ✓ Check gender match                       │
│    ✓ Check income limit                       │
│    ✓ Check occupation match                   │
│    ✓ Check state availability                 │
│    ✓ Check category match (SC/ST/OBC/Gen)     │
│    ✓ Check BPL requirement                    │
│    ✓ Check land holding limit                 │
│                                               │
│  Output: List of potentially eligible schemes │
│  (schemes that don't violate any hard rule)   │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│          STAGE 2: RAG SEMANTIC SEARCH         │
│                                               │
│  If user provided a natural language query:   │
│    1. Embed query using sentence-transformer  │
│    2. Search ChromaDB vector store            │
│    3. Find top-K semantically similar schemes │
│    4. Merge with Stage 1 results              │
│    5. Boost scores for schemes in both lists  │
│                                               │
│  If no query (profile-only matching):         │
│    Skip this stage, use Stage 1 results       │
│                                               │
│  Output: Ranked candidate list                │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────┐
│       STAGE 3: LLM REASONING & RANKING        │
│                                               │
│  Send to LLM:                                 │
│    - User profile                             │
│    - Candidate schemes (from Stage 1+2)       │
│    - User's language preference               │
│                                               │
│  LLM performs:                                │
│    1. Edge case reasoning                     │
│       ("0.6 hectares = marginal farmer ✓")   │
│    2. Eligibility confidence scoring (0-100)  │
│    3. Benefit relevance ranking               │
│    4. Personalized explanation generation     │
│    5. Application priority recommendation     │
│                                               │
│  Output: Final ranked schemes with scores     │
│          and personalized explanations         │
└───────────────────┬──────────────────────────┘
                    │
                    ▼
Final Scheme Recommendations
```
### 5.3.2 Rule-Based Filter Implementation
```
class SchemeRuleFilter:
    """
    Hard rule-based eligibility filter. 
    A scheme is EXCLUDED if user violates ANY mandatory criterion.
    """
    
    def filter(self, user_profile: dict, schemes: list) -> list:
        eligible_schemes = []
        
        for scheme in schemes:
            eligibility = scheme["eligibility"]
            is_eligible = True
            reasons = []
            
            # Age check
            if eligibility.get("age_min") and user_profile.get("age"):
                if user_profile["age"] < eligibility["age_min"]:
                    is_eligible = False
                    reasons.append(f"Age {user_profile['age']} below minimum {eligibility['age_min']}")
            
            if eligibility.get("age_max") and user_profile.get("age"):
                if user_profile["age"] > eligibility["age_max"]:
                    is_eligible = False
                    reasons.append(f"Age {user_profile['age']} above maximum {eligibility['age_max']}")
            
            # Gender check
            if eligibility.get("gender") != "all" and user_profile.get("gender"):
                if user_profile["gender"] != eligibility["gender"]:
                    is_eligible = False
                    reasons.append(f"Gender mismatch: requires {eligibility['gender']}")
            
            # Income check
            if eligibility.get("income_max_annual") and user_profile.get("annual_income"):
                if user_profile["annual_income"] > eligibility["income_max_annual"]:
                    is_eligible = False
                    reasons.append(f"Income ₹{user_profile['annual_income']} exceeds limit ₹{eligibility['income_max_annual']}")
            
            # Occupation check
            if eligibility.get("occupation") and eligibility["occupation"] != ["all"]:
                if user_profile.get("occupation") and user_profile["occupation"] not in eligibility["occupation"]:
                    is_eligible = False
                    reasons.append(f"Occupation '{user_profile['occupation']}' not in eligible list")
            
            # State check
            if eligibility.get("states") and eligibility["states"] != ["all"]:
                if user_profile.get("state") and user_profile["state"] not in eligibility["states"]:
                    is_eligible = False
                    reasons.append(f"State '{user_profile['state']}' not covered")
            
            # Category check
            if eligibility.get("category") and eligibility["category"] != ["all"]:
                if user_profile.get("category") and user_profile["category"] not in eligibility["category"]:
                    is_eligible = False
                    reasons.append(f"Category '{user_profile['category']}' not eligible")
            
            # BPL check
            if eligibility.get("is_bpl_required") and eligibility["is_bpl_required"]:
                if user_profile.get("is_bpl") == False:
                    is_eligible = False
                    reasons.append("Requires BPL status")
            
            # Land holding check
            if eligibility.get("land_holding_max_hectares") and user_profile.get("land_holding_hectares"):
                if user_profile["land_holding_hectares"] > eligibility["land_holding_max_hectares"]:
                    is_eligible = False
                    reasons.append(f"Land holding exceeds maximum")
            
            if is_eligible:
                eligible_schemes.append({
                    "scheme": scheme,
                    "filter_result": "eligible",
                    "unknown_fields": [k for k, v in user_profile.items() if v is None]
                })
        
        return eligible_schemes
```
### 5.4 Document Readiness Scorer
```
class DocumentReadinessScorer:
    """
    Calculates document readiness score for each scheme
    based on user's available documents.
    """
    
    def calculate_readiness(
        self, 
        scheme: dict, 
        uploaded_documents: list,  # ['aadhaar_card', 'bank_passbook']
        profile: dict              # Profile mentions (has_bank_account, etc.)
    ) -> dict:
        
        required_docs = scheme["documents_required"]
        readiness_details = []
        ready_count = 0
        
        for doc in required_docs:
            doc_status = self._check_document_availability(
                doc, uploaded_documents, profile
            )
            readiness_details.append(doc_status)
            if doc_status["status"] == "available":
                ready_count += 1
        
        total = len(required_docs)
        
        return {
            "ready": ready_count,
            "total": total,
            "percentage": round((ready_count / total) * 100) if total > 0 else 0,
            "documents": readiness_details,
            "next_steps": self._generate_next_steps(readiness_details),
            "estimated_preparation_time": self._estimate_preparation_time(readiness_details)
        }
    
    def _check_document_availability(self, doc, uploaded_docs, profile):
        doc_name = doc["document_name"].lower()
        
        # Check if document was uploaded
        doc_type_mapping = {
            "aadhaar card": "aadhaar_card",
            "ration card": "ration_card",
            "income certificate": "income_certificate",
            "bank account": "bank_passbook",
            "pan card": "pan_card",
            "voter id": "voter_id"
        }
        
        mapped_type = doc_type_mapping.get(doc_name)
        
        if mapped_type and mapped_type in uploaded_docs:
            return {
                "name": doc["document_name"],
                "status": "available",
                "source": "uploaded",
                "icon": "✅"
            }
        
        # Check if mentioned in profile
        profile_document_mapping = {
            "bank account": "has_bank_account",
            "aadhaar card": "has_aadhaar",
            "mobile number": True  # Always assumed available
        }
        
        profile_key = profile_document_mapping.get(doc_name)
        if profile_key == True or (profile_key and profile.get(profile_key)):
            return {
                "name": doc["document_name"],
                "status": "available",
                "source": "mentioned_in_profile",
                "icon": "✅"
            }
        
        # Document is missing
        return {
            "name": doc["document_name"],
            "status": "missing",
            "icon": "❌",
            "where_to_obtain": doc.get("where_to_obtain", "Contact local government office"),
            "estimated_time": doc.get("estimated_time", "7-15 working days"),
            "tips": doc.get("tips", ""),
            "alternatives": doc.get("alternatives", [])
        }
    
    def _generate_next_steps(self, readiness_details):
        missing = [d for d in readiness_details if d["status"] == "missing"]
        if not missing:
            return "All documents ready! You can apply now."
        
        # Sort by estimated time (shortest first)
        steps = []
        for i, doc in enumerate(missing, 1):
            steps.append(f"{i}. Get {doc['name']} from {doc.get('where_to_obtain', 'local office')}")
        
        return "\n".join(steps)
    
    def _estimate_preparation_time(self, readiness_details):
        missing = [d for d in readiness_details if d["status"] == "missing"]
        if not missing:
            return "Ready to apply now"
        
        max_time = 0
        for doc in missing:
            time_str = doc.get("estimated_time", "7-15 days")
            # Extract max days from string like "7-15 working days"
            import re
            numbers = re.findall(r'\d+', time_str)
            if numbers:
                max_time = max(max_time, max(int(n) for n in numbers))
        
        return f"Approximately {max_time} working days (documents can be obtained in parallel)"
```
### 5.5 Scheme Comparison Engine
```
class SchemeComparator:
    """
    Compares multiple schemes and generates AI-powered recommendation.
    """
    
    def compare(
        self,
        schemes: list,
        profile: dict,
        document_readiness: dict,
        language: str
    ) -> dict:
        
        comparison_data = []
        
        for scheme in schemes:
            scheme_id = scheme["scheme_id"]
            readiness = document_readiness.get(scheme_id, {})
            
            comparison_data.append({
                "scheme_id": scheme_id,
                "name": scheme["name_en"],
                "name_local": scheme.get(f"name_{language}", scheme["name_en"]),
                "benefit_amount": scheme["benefits"]["amount"],
                "benefit_type": scheme["benefits"]["type"],
                "eligibility_score": scheme.get("eligibility_score", 0),
                "document_readiness_percentage": readiness.get("percentage", 0),
                "application_complexity": self._assess_complexity(scheme),
                "estimated_time_to_benefit": self._estimate_time(scheme)
            })
        
        # Sort by composite score
        for item in comparison_data:
            item["composite_score"] = (
                item["eligibility_score"] * 0.3 +
                item["document_readiness_percentage"] * 0.4 +
                (100 - self._complexity_to_score(item["application_complexity"])) * 0.3
            )
        
        comparison_data.sort(key=lambda x: x["composite_score"], reverse=True)
        
        # Assign priority ranks
        for i, item in enumerate(comparison_data):
            item["priority_rank"] = i + 1
        
        # Generate AI recommendation using LLM
        recommendation = self._generate_recommendation(
            comparison_data, profile, language
        )
        
        return {
            "comparison": comparison_data,
            "ai_recommendation": recommendation,
            "comparison_summary": {
                "best_immediate_benefit": comparison_data[0]["scheme_id"],
                "easiest_to_apply": min(comparison_data, key=lambda x: self._complexity_to_score(x["application_complexity"]))["scheme_id"]
            }
        }
```
### 6. Data Design
#### 6.1 Scheme Data Structure (JSON)
```

// Example: data/schemes/agriculture.json
{
  "schemes": [
    {
      "scheme_id": "PM_KISAN_001",
      "name_en": "Pradhan Mantri Kisan Samman Nidhi",
      "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
      "name_ta": "பிரதான் மந்திரி கிசான் சம்மான் நிதி",
      "name_te": "ప్రధాన్ మంత్రి కిసాన్ సమ్మాన్ నిధి",
      "ministry": "Ministry of Agriculture & Farmers Welfare",
      "categories": ["agriculture", "financial_assistance", "cash_transfer"],
      "description_en": "Financial benefit of Rs. 6000 per year to small and marginal farmer families with cultivable land holding.",
      "description_hi": "छोटे और सीमांत किसान परिवारों को प्रति वर्ष ₹6,000 की आर्थिक सहायता, जिनके पास खेती योग्य भूमि है।",
      "eligibility": {
        "age_min": 18,
        "age_max": null,
        "gender": "all",
        "income_max_annual": null,
        "occupation": ["farmer", "agricultural_laborer"],
        "category": ["all"],
        "states": ["all"],
        "is_bpl_required": false,
        "land_holding_max_hectares": 2.0,
        "additional_criteria": "Must have cultivable land. Institutional land holders excluded. Former/present ministers, MPs, MLAs not eligible."
      },
      "benefits": {
        "type": "cash_transfer",
        "amount": "₹6,000 per year",
        "frequency": "3 installments of ₹2,000 every 4 months",
        "details": "Direct Bank Transfer to Aadhaar-linked bank account"
      },
      "documents_required": [
        {
          "document_name": "Aadhaar Card",
          "is_mandatory": true,
          "where_to_obtain": "UIDAI center or post office",
          "estimated_time": "Already available for most citizens",
          "alternatives": []
        },
        {
          "document_name": "Land Ownership Record",
          "is_mandatory": true,
          "where_to_obtain": "Patwari Office / Tehsil / Revenue Department",
          "estimated_time": "3-7 working days",
          "tips": "Carry old land documents, Aadhaar. In some states available online.",
          "alternatives": ["Khasra-Khatauni", "7/12 Extract", "RoR", "Land Patta"]
        },
        {
          "document_name": "Bank Account Details",
          "is_mandatory": true,
          "where_to_obtain": "Any bank branch",
          "estimated_time": "Same day (Jan Dhan account)",
          "alternatives": ["Bank Passbook", "Cancelled Cheque"]
        },
        {
          "document_name": "Mobile Number",
          "is_mandatory": true,
          "where_to_obtain": "Any mobile operator",
          "estimated_time": "Same day",
          "alternatives": []
        },
        {
          "document_name": "Income Certificate",
          "is_mandatory": false,
          "where_to_obtain": "District Collectorate / Tehsil / CSC / e-District Portal",
          "estimated_time": "7-15 working days",
          "tips": "Some states accept self-declaration",
          "alternatives": ["Self-declaration form", "BPL Card"]
        }
      ],
      "application_process": {
        "online": {
          "portal_url": "https://pmkisan.gov.in",
          "steps": [
            "Visit pmkisan.gov.in",
            "Click 'New Farmer Registration'",
            "Select your state",
            "Enter Aadhaar number",
            "Enter mobile number linked to Aadhaar",
            "Fill land details (Khasra number, area)",
            "Enter bank account details",
            "Submit registration",
            "Note down registration number for tracking"
          ]
        },
        "offline": {
          "office": "Nearest Common Service Center (CSC) or Agriculture Office",
          "steps": [
            "Visit nearest CSC or Krishi Vibhag office",
            "Carry Aadhaar, land papers, bank passbook",
            "CSC operator will fill the form for you",
            "Get acknowledgment receipt",
            "Track status on pmkisan.gov.in"
          ]
        },
        "via_csc": true
      },
      "helpline": "155261 / 011-24300606",
      "official_url": "https://pmkisan.gov.in",
      "launched_year": 2019,
      "last_updated": "2024-01-15"
    }
  ]
}
```
### 6.2 Vector Store Schema (ChromaDB)
```
# Vector store initialization
collection = chroma_client.create_collection(
    name="government_schemes",
    metadata={"hnsw:space": "cosine"}
)

# Each scheme is stored as a document in the vector store
# with searchable text combining name + description + eligibility + benefits
scheme_text = f"""
Scheme: {scheme['name_en']}
Description: {scheme['description_en']}
Category: {', '.join(scheme['categories'])}
Eligibility: {scheme['eligibility']['additional_criteria']}
Benefits: {scheme['benefits']['amount']} - {scheme['benefits']['details']}
Occupation: {', '.join(scheme['eligibility']['occupation'])}
"""

collection.add(
    documents=[scheme_text],
    metadatas=[{
        "scheme_id": scheme["scheme_id"],
        "categories": ",".join(scheme["categories"]),
        "benefit_type": scheme["benefits"]["type"]
    }],
    ids=[scheme["scheme_id"]]
)
```
### 6.3 Session Data Structure (In-Memory)
```
session_data = {
    "session_id": "uuid",
    "created_at": "ISO timestamp",
    "language": "hi",
    "profile": {
        # User profile (same as profile store)
    },
    "chat_history": [
        {"role": "assistant", "content": "...", "timestamp": "..."},
        {"role": "user", "content": "...", "timestamp": "..."}
    ],
    "uploaded_documents": [
        {
            "type": "aadhaar_card",
            "extracted_data": {},
            "uploaded_at": "ISO timestamp"
        }
    ],
    "matched_schemes": [],
    "document_readiness": {},
    "conversation_phase": "profiling",
    "expires_at": "ISO timestamp (30 minutes from last activity)"
}
```
### 7. Translation & Multilingual Design
#### 7.1 Translation Architecture
```
User Input (any language)
         │
         ▼
┌─────────────────────┐
│ Language Detection   │
│ (from LLM or        │
│  langdetect library) │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐     ┌─────────────────────────┐
│ If Hindi/English:    │    │ If Other Language:      │
│ Process directly     │    │ Translate to Hindi      │
│ with LLM            │     │ via Bhashini API        │
└─────────┬───────────┘     │ Then process with LLM   │
          │                 │ Then translate response │
          │                 │ back to user language   │
          │                 └─────────┬───────────────┘
          │                            │
          ▼                            ▼
     Response in                 Response in
     Hindi/English              user's language
```
#### 7.2 i18n Structure (Frontend)
```
// locales/hi/translation.json
{
  "welcome": {
    "title": "जन सहायक",
    "subtitle": "आपका AI सहायक — सरकारी योजनाओं की जानकारी",
    "select_language": "अपनी भाषा चुनें",
    "or_speak": "या बोलकर शुरू करें",
    "tap_mic": "माइक दबाएं और बोलें"
  },
  "chat": {
    "type_message": "अपना सवाल लिखें...",
    "send": "भेजें",
    "recording": "सुन रहे हैं...",
    "processing": "सोच रहे हैं...",
    "upload_doc": "दस्तावेज़ अपलोड करें",
    "find_schemes": "योजनाएं खोजें",
    "compare": "तुलना करें"
  },
  "schemes": {
    "eligible_schemes": "आपके लिए योजनाएं",
    "eligibility_match": "पात्रता",
    "document_readiness": "दस्तावेज़ तैयारी",
    "view_details": "विवरण देखें",
    "apply_now": "आवेदन करें",
    "benefit": "लाभ",
    "documents_needed": "ज़रूरी दस्तावेज़",
    "how_to_apply": "कैसे आवेदन करें",
    "helpline": "हेल्पलाइन"
  },
  "documents": {
    "upload_title": "दस्तावेज़ अपलोड करें",
    "take_photo": "फोटो खींचें",
    "choose_file": "फाइल चुनें",
    "processing": "दस्तावेज़ पढ़ रहे हैं...",
    "confirm_data": "क्या यह जानकारी सही है?",
    "available": "उपलब्ध",
    "missing": "अनुपलब्ध",
    "where_to_get": "कहां से मिलेगा"
  },
  "common": {
    "yes": "हां",
    "no": "नहीं",
    "back": "वापस",
    "next": "आगे",
    "loading": "लोड हो रहा है...",
    "error": "कुछ गड़बड़ हुई, फिर कोशिश करें",
    "new_session": "नई शुरुआत"
  }
}
```
#### 8. Security Design
##### 8.1 Security Architecture
```
┌────────────────────────────────────────────────┐
│                SECURITY LAYERS                  │
│                                                 │
│  Layer 1: Transport Security                    │
│  ├── HTTPS only (TLS 1.2+)                    │
│  └── HSTS headers                              │
│                                                 │
│  Layer 2: API Security                          │
│  ├── CORS whitelist (frontend domain only)     │
│  ├── Rate limiting (60 req/min per IP)         │
│  ├── Request size limits (10MB max)            │
│  └── Input sanitization                         │
│                                                 │
│  Layer 3: Data Privacy                          │
│  ├── No persistent user data storage           │
│  ├── Aadhaar masking (XXXX-XXXX-1234)         │
│  ├── Document images processed in-memory       │
│  ├── Session auto-expiry (30 minutes)          │
│  └── No server-side logging of user data       │
│                                                 │
│  Layer 4: AI Safety                             │
│  ├── Prompt injection prevention               │
│  ├── Output validation (no hallucinated data)  │
│  ├── Scheme data sourced only from database    │
│  └── Sensitive content filtering               │
│                                                 │
│  Layer 5: Infrastructure                        │
│  ├── Environment variables for API keys        │
│  ├── .env files in .gitignore                  │
│  ├── No secrets in client-side code            │
│  └── Dependency vulnerability scanning          │
└────────────────────────────────────────────────┘
```
#### 8.2 Privacy Data Flow
```
Document Upload → OCR Processing → LLM Parsing → Profile Update → Document Discarded
                  (in-memory)      (in-memory)    (session only)   (never saved to disk)

Aadhaar Number → Extracted → Immediately Masked → Only masked version used
                             (XXXX-XXXX-1234)    (original never stored)

Chat Messages → Processed by LLM → Response generated → Messages kept in session only
                (API call)                               (cleared on session end)

Session Data → Stored in server memory → Auto-deleted after 30 min inactivity
               (never written to database)
```
#### 9. Deployment Architecture
##### 9.1 Deployment Diagram
```
┌─────────────────────────────────────────────────┐
│                  DEPLOYMENT                      │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │         FRONTEND HOSTING                    │  │
│  │         (Vercel / Netlify)                  │  │
│  │                                             │  │
│  │  React App → Build → Static files          │  │
│  │  CDN distribution                           │  │
│  │  Custom domain (optional)                   │  │
│  │  HTTPS auto-configured                      │  │
│  └─────────────────────┬──────────────────────┘  │
│                        │ API calls               │
│  ┌─────────────────────▼──────────────────────┐  │
│  │         BACKEND HOSTING                     │  │
│  │         (Railway / Render / AWS EC2)         │  │
│  │                                             │  │
│  │  FastAPI + Uvicorn                          │  │
│  │  ChromaDB (embedded)                        │  │
│  │  Tesseract OCR (installed)                  │  │
│  │  Python 3.11+ runtime                       │  │
│  │                                             │  │
│  │  Environment Variables:                      │  │
│  │  - OPENAI_API_KEY                           │  │
│  │  - BHASHINI_API_KEY                         │  │
│  │  - ALLOWED_ORIGINS                          │  │
│  └─────────────────────┬──────────────────────┘  │
│                        │                         │
│  ┌─────────────────────▼──────────────────────┐  │
│  │         EXTERNAL APIS                       │  │
│  │                                             │  │
│  │  OpenAI API (GPT-4o-mini + Whisper)        │  │
│  │  Bhashini API (Translation + TTS)          │  │
│  │  Google Cloud Vision (OCR fallback)        │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```
#### 9.2 CI/CD Pipeline
```
Developer pushes code to GitHub
         │
         ▼
┌──────────────────────┐
│ GitHub Actions       │
│                      │
│ 1. Lint check        │
│ 2. Run tests         │
│ 3. Build React app   │
│ 4. Deploy frontend   │
│    to Vercel         │
│ 5. Deploy backend    │
│    to Railway/Render │
└──────────────────────┘
```
#### 10. Error Handling & Fallback Strategy
```
┌────────────────────────────────────────────────────────────┐
│                   GRACEFUL DEGRADATION                     │
│                                                            │
│  Service Failure          │  Fallback                      │
│  ─────────────────────────┼─────────────────────────────── │
│  OpenAI API down          │  Show cached scheme data from  │
│                           │  database (no AI conversation) │
│  ─────────────────────────┼─────────────────────────────── │
│  OCR (Tesseract) fails    │  Show "Document not readable"  │
│                           │  → Prompt manual data entry    │
│  ─────────────────────────┼─────────────────────────────── │
│  Whisper (voice) fails    │  Show "Voice not available"    │
│                           │  → Use text input              │
│  ─────────────────────────┼─────────────────────────────── │
│  Bhashini API down        │  Fallback to Google Translate  │
│                           │  or respond in Hindi/English   │
│  ─────────────────────────┼─────────────────────────────── │
│  ChromaDB fails           │  Use rule-based matching only  │
│                           │  (skip semantic search)        │
│  ─────────────────────────┼─────────────────────────────── │
│  Network timeout          │  Show last cached response     │
│                           │  + retry button                │
│  ─────────────────────────┼─────────────────────────────── │
│  Rate limit exceeded      │  Queue request, show message   │
│                           │  "Please wait a moment"        │
└────────────────────────────────────────────────────────────┘
```
### 11. Performance Optimization

##### 11.1 Frontend Optimizations

| Optimization | Implementation | Impact |
|---|---|---|
| Code splitting | `React.lazy()` + `Suspense` for route-based splitting. Chat, Schemes, Compare pages loaded on demand | Reduces initial bundle by ~40% |
| Image optimization | WebP format for all images, lazy loading via `loading="lazy"`, compressed SVG icons instead of PNG | Saves 200-500KB on initial load |
| Bundle size | Tree shaking via Vite, minimal dependencies, avoid importing entire libraries (e.g., `import { Button } from 'component'` not `import * from 'library'`) | Target: < 200KB gzipped JS bundle |
| Caching strategy | Service worker caches static assets (CSS, JS, images). API responses cached in Zustand store for current session | Instant navigation after first load |
| Font optimization | Use system fonts as primary (`-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`). Load Noto Sans for Indic scripts only when that language is selected | Avoids 500KB+ font download upfront |
| API call optimization | Debounce chat input (300ms). Cancel in-flight requests on new input. Batch profile updates | Reduces API calls by ~30% |
| Skeleton loading | Show skeleton UI placeholders while scheme cards, document results load | Perceived performance improvement |
| Virtual scrolling | For scheme lists > 20 items, use `react-window` for virtualized rendering | Smooth scrolling even with 100+ schemes |
| Responsive images | `srcset` for different screen densities. Serve smaller images on mobile | 50% image size reduction on mobile |
| Preconnect | `<link rel="preconnect">` for API server and external services (OpenAI, Bhashini) | Reduces DNS + TLS handshake latency by 100-300ms |

### 11.2 Backend Optimizations

| Optimization | Implementation | Impact |
|---|---|---|
| Async everywhere | All FastAPI endpoints are `async`. Use `httpx.AsyncClient` for external API calls. `asyncio.gather()` for parallel operations | 3-5x throughput improvement |
| Scheme data caching | Load scheme database into memory on startup. Cache in `cachetools.TTLCache` (1 hour TTL). Avoid re-reading JSON files on every request | < 1ms scheme lookup vs 10-50ms file read |
| Vector store warm-up | Initialize ChromaDB collection and load embeddings on app startup, not on first request | Eliminates 2-3 second cold start on first search |
| LLM response streaming | Use OpenAI streaming API (`stream=True`). Stream tokens to frontend via Server-Sent Events (SSE) | User sees response appearing in real-time instead of waiting 3-5 seconds |
| OCR preprocessing | Resize images to max 2000px before OCR. Convert to grayscale. Apply adaptive thresholding | 40-60% faster OCR processing |
| Connection pooling | Reuse HTTP connections to OpenAI, Bhashini APIs via persistent `httpx.AsyncClient` | Saves 50-100ms per API call |
| LLM prompt caching | Cache common LLM prompts (system prompt, scheme matching prompt) as pre-formatted strings. Only inject dynamic content | Reduces prompt token count by ~30% |
| Response compression | Enable gzip compression for all API responses via FastAPI middleware | 60-80% reduction in response payload size |
| Parallel processing | When matching schemes: run rule-based filter and RAG search in parallel using `asyncio.gather()` | 40% faster scheme matching |
| Session cleanup | Background task runs every 5 minutes to clean expired sessions (> 30 min inactive) | Prevents memory leaks |

### 11.3 Performance Budgets

```
┌───────────────────────────────────────────────────────────┐
│              PERFORMANCE BUDGET TARGETS                   │
│                                                           │
│  Metric                    │  Target     │  Max Allowed   │
│  ──────────────────────────┼─────────────┼──────────────  │
│  Initial page load (3G)    │  < 2s       │  3s            │
│  Time to Interactive       │  < 3s       │  5s            │
│  JS bundle size (gzipped)  │  < 150KB    │  200KB         │
│  CSS size (gzipped)        │  < 30KB     │  50KB          │
│  Chat response (text)      │  < 2s       │  3s            │
│  Chat response (streaming) │  < 500ms    │  1s (first     │
│                            │  first token│  token)        │
│  Document OCR              │  < 5s       │  10s           │
│  Scheme matching           │  < 3s       │  5s            │
│  Voice transcription       │  < 3s       │  5s            │
│  Image upload              │  < 2s       │  5s            │
│  Lighthouse score (mobile) │  > 80       │  > 70          │
│  Memory usage (backend)    │  < 512MB    │  1GB           │
└───────────────────────────────────────────────────────────┘
```

### 11.4 Low Bandwidth Optimization Strategy

```
┌──────────────────────────────────────────────────────────┐
│          LOW BANDWIDTH STRATEGY (< 2G / 256 kbps)        │
│                                                          │
│  1. TEXT-FIRST RENDERING                                 │
│     • Chat messages rendered as plain text immediately   │
│     • Scheme cards show text data first, icons later     │
│     • No images required for core functionality          │
│                                                          │
│  2. PROGRESSIVE ENHANCEMENT                              |
│     • Core: Text chat + scheme list (works on 2G)        │
│     • Enhanced: Voice input + document upload (3G+)      │
│     • Full: Animations + rich UI (4G+/WiFi)              │
│                                                          │
│  3. API PAYLOAD OPTIMIZATION                             │
│     • Compressed JSON responses (gzip)                   │
│     • Paginated scheme results (5 per page)              │
│     • Minimal response fields (details on demand)        │
│     • Image compression before upload (client-side)      │
│                                                          │
│  4. OFFLINE RESILIENCE                                   │
│     • Cache last fetched scheme list in localStorage     │
│     • Show cached data if network fails                  │
│     • Queue chat messages and send when online           │
│                                                          │
│  5. CLIENT-SIDE IMAGE COMPRESSION                        │
│     • Compress document photos to < 500KB before upload  │
│     • Use canvas API for resizing                        │
│     • Convert to JPEG with 70% quality                   │
└──────────────────────────────────────────────────────────┘
```

---

## 12. Testing Strategy

### 12.1 Testing Pyramid

```
                    ┌──────────┐
                    │   E2E    │  ← 5 critical user journeys
                    │  Tests   │     (Cypress/Playwright)
                  ┌─┴──────────┴─┐
                  │ Integration   │  ← API endpoint tests
                  │   Tests       │     (pytest + httpx)
                ┌─┴───────────────┴─┐
                │    Unit Tests      │  ← Core engine logic
                │                    │     (pytest)
              ┌─┴────────────────────┴─┐
              │   Component Tests       │  ← React component tests
              │                         │     (Vitest + React Testing Library)
              └─────────────────────────┘
```

### 12.2 Test Scenarios

#### 12.2.1 Unit Tests (Backend)

```python
# test_scheme_matcher.py

class TestSchemeRuleFilter:
    
    def test_farmer_eligible_for_pm_kisan(self):
        """45-year-old farmer with 0.6 hectares should match PM-KISAN"""
        profile = {
            "age": 45, "occupation": "farmer", "state": "Madhya Pradesh",
            "land_holding_hectares": 0.6, "category": "OBC", "gender": "male"
        }
        result = rule_filter.filter(profile, scheme_database)
        scheme_ids = [s["scheme"]["scheme_id"] for s in result]
        assert "PM_KISAN_001" in scheme_ids
    
    def test_high_income_excluded_from_bpl_scheme(self):
        """Person with income > 2.5L should not match BPL-only schemes"""
        profile = {"annual_income": 500000, "is_bpl": False}
        result = rule_filter.filter(profile, scheme_database)
        bpl_schemes = [s for s in result if s["scheme"]["eligibility"]["is_bpl_required"]]
        assert len(bpl_schemes) == 0
    
    def test_woman_gets_women_specific_schemes(self):
        """Female user should see women-specific schemes"""
        profile = {"age": 28, "gender": "female", "occupation": "self_employed"}
        result = rule_filter.filter(profile, scheme_database)
        scheme_ids = [s["scheme"]["scheme_id"] for s in result]
        assert "MUDRA_001" in scheme_ids
        assert "STANDUP_INDIA_001" in scheme_ids
    
    def test_senior_citizen_gets_pension_schemes(self):
        """65-year-old should see pension schemes"""
        profile = {"age": 65, "gender": "male", "occupation": "retired"}
        result = rule_filter.filter(profile, scheme_database)
        categories = [cat for s in result for cat in s["scheme"]["categories"]]
        assert "pension" in categories or "social_security" in categories
    
    def test_unknown_fields_dont_exclude(self):
        """Null/unknown profile fields should not exclude schemes"""
        profile = {"age": 30, "gender": "male", "occupation": None, "income": None}
        result = rule_filter.filter(profile, scheme_database)
        assert len(result) > 0  # Should still return some schemes

class TestDocumentReadinessScorer:
    
    def test_uploaded_aadhaar_marked_available(self):
        """Uploaded Aadhaar should show as available"""
        readiness = scorer.calculate_readiness(
            scheme=pm_kisan_scheme,
            uploaded_documents=["aadhaar_card"],
            profile={"has_bank_account": True}
        )
        aadhaar_doc = next(d for d in readiness["documents"] if "Aadhaar" in d["name"])
        assert aadhaar_doc["status"] == "available"
        assert aadhaar_doc["source"] == "uploaded"
    
    def test_missing_documents_have_guidance(self):
        """Missing documents should include where_to_obtain"""
        readiness = scorer.calculate_readiness(
            scheme=pm_kisan_scheme,
            uploaded_documents=[],
            profile={}
        )
        missing_docs = [d for d in readiness["documents"] if d["status"] == "missing"]
        for doc in missing_docs:
            assert "where_to_obtain" in doc
            assert doc["where_to_obtain"] != ""
    
    def test_readiness_percentage_calculation(self):
        """Readiness percentage should be accurate"""
        readiness = scorer.calculate_readiness(
            scheme=pm_kisan_scheme,  # 5 required documents
            uploaded_documents=["aadhaar_card"],
            profile={"has_bank_account": True}
        )
        # Aadhaar (uploaded) + Bank (profile) + Mobile (assumed) = 3/5
        assert readiness["ready"] == 3
        assert readiness["total"] == 5
        assert readiness["percentage"] == 60

class TestDocumentOCR:
    
    def test_aadhaar_number_masking(self):
        """Aadhaar number should be masked in output"""
        extracted = document_engine.process("aadhaar_image.jpg")
        assert "XXXX-XXXX" in extracted["aadhaar_number_masked"]
        assert len(extracted["aadhaar_number_masked"]) == 14  # XXXX-XXXX-1234
    
    def test_age_calculated_from_dob(self):
        """Age should be auto-calculated from DOB"""
        extracted = document_engine.process("aadhaar_image.jpg")
        assert extracted["age"] is not None
        assert isinstance(extracted["age"], int)
```

#### 12.2.2 Integration Tests (API)

```python
# test_api.py

class TestChatAPI:
    
    async def test_chat_returns_profile_updates(self):
        """Chat endpoint should extract profile from message"""
        response = await client.post("/api/chat", json={
            "session_id": "test-123",
            "message": "Main 45 saal ka kisan hoon MP se",
            "language": "hi",
            "chat_history": [],
            "current_profile": {}
        })
        assert response.status_code == 200
        data = response.json()
        assert data["response"]["extracted_profile_updates"]["age"] == 45
        assert data["response"]["extracted_profile_updates"]["occupation"] == "farmer"
    
    async def test_chat_maintains_context(self):
        """Follow-up messages should maintain conversation context"""
        # First message
        r1 = await client.post("/api/chat", json={
            "message": "Main kisan hoon",
            "chat_history": []
        })
        # Follow-up
        r2 = await client.post("/api/chat", json={
            "message": "Aur koi scheme hai?",
            "chat_history": r1.json()["chat_history"]
        })
        assert r2.status_code == 200
        # Response should reference farming context

class TestDocumentUploadAPI:
    
    async def test_document_upload_returns_extracted_data(self):
        """Document upload should return structured extracted data"""
        with open("test_aadhaar.jpg", "rb") as f:
            response = await client.post(
                "/api/document/upload",
                files={"file": ("aadhaar.jpg", f, "image/jpeg")},
                data={"session_id": "test-123", "language": "hi"}
            )
        assert response.status_code == 200
        data = response.json()
        assert "extracted_data" in data["response"]
        assert "name" in data["response"]["extracted_data"]

class TestSchemeMatchAPI:
    
    async def test_scheme_match_returns_results(self):
        """Scheme matching should return ranked schemes"""
        response = await client.post("/api/schemes/match", json={
            "session_id": "test-123",
            "profile": {
                "age": 45, "gender": "male", "state": "Madhya Pradesh",
                "occupation": "farmer", "annual_income": 150000,
                "category": "OBC", "land_holding_hectares": 0.6
            },
            "language": "hi"
        })
        assert response.status_code == 200
        data = response.json()
        assert len(data["response"]["schemes"]) > 0
        assert data["response"]["schemes"][0]["eligibility_score"] > 0
```

#### 12.2.3 E2E Test Scenarios

```
E2E TEST 1: Complete Farmer Journey
  1. Open app → Select Hindi
  2. Chat: "Main 45 saal ka kisan hoon MP se, income 1.5 lakh"
  3. AI asks follow-up → Answer remaining questions
  4. Confirm profile
  5. View matched schemes → PM-KISAN should appear
  6. Click PM-KISAN → View details + document checklist
  Expected: Full flow completes in < 3 minutes

E2E TEST 2: Document Upload Journey
  1. Open app → Select English
  2. Click "Upload Document" → Upload Aadhaar photo
  3. Confirm extracted data
  4. AI fills profile from document
  5. Answer 2-3 remaining questions
  6. View matched schemes with document readiness
  Expected: Aadhaar data correctly extracted, readiness shows "1/5 available"

E2E TEST 3: Scheme Comparison Journey
  1. Complete profile (via chat or document)
  2. View matched schemes
  3. Select 3 schemes for comparison
  4. View comparison table
  5. Read AI recommendation
  Expected: Comparison table renders correctly, recommendation is personalized

E2E TEST 4: Voice Input Journey
  1. Open app → Tap microphone
  2. Speak in Hindi: "Mujhe kisan wali scheme ke baare mein batao"
  3. AI transcribes and responds
  Expected: Voice correctly transcribed, relevant response generated

E2E TEST 5: Language Switch Journey
  1. Start in English → Complete partial profile
  2. Switch to Hindi mid-conversation
  3. Continue conversation in Hindi
  Expected: Context preserved, response language switches correctly
```

### 12.3 Test Data

```json
// test_profiles.json — Standard test profiles for validation

{
  "test_profiles": [
    {
      "name": "Small Farmer",
      "profile": {
        "age": 45, "gender": "male", "state": "Madhya Pradesh",
        "occupation": "farmer", "annual_income": 150000,
        "category": "OBC", "family_size": 5,
        "land_holding_hectares": 0.6, "is_bpl": false
      },
      "expected_schemes": ["PM_KISAN_001", "KCC_001", "PM_FASAL_BIMA_001"],
      "expected_min_matches": 5
    },
    {
      "name": "Young Woman Entrepreneur",
      "profile": {
        "age": 28, "gender": "female", "state": "Uttar Pradesh",
        "occupation": "self_employed", "annual_income": 200000,
        "category": "General", "family_size": 3,
        "education": "graduate"
      },
      "expected_schemes": ["MUDRA_001", "STANDUP_INDIA_001"],
      "expected_min_matches": 4
    },
    {
      "name": "Senior Citizen",
      "profile": {
        "age": 68, "gender": "male", "state": "Rajasthan",
        "occupation": "retired", "annual_income": 80000,
        "category": "SC", "family_size": 2
      },
      "expected_schemes": ["PM_SHRAM_YOGI_001", "NSAP_001", "AYUSHMAN_001"],
      "expected_min_matches": 4
    },
    {
      "name": "BPL Rural Woman",
      "profile": {
        "age": 35, "gender": "female", "state": "Bihar",
        "occupation": "laborer", "annual_income": 50000,
        "category": "SC", "family_size": 6, "is_bpl": true
      },
      "expected_schemes": ["AYUSHMAN_001", "PM_AWAS_GRAMIN_001", "PM_MATRU_001"],
      "expected_min_matches": 8
    }
  ]
}
```

---

## 13. Accessibility Design

### 13.1 WCAG 2.1 Compliance Targets

```
┌──────────────────────────────────────────────────────────┐
│              ACCESSIBILITY STANDARDS                     │
│                                                          │
│  Level A (Mandatory):                                    │
│  ├── All images have alt text                            │
│  ├── All form inputs have labels                         │
│  ├── Color is not the only means of conveying info       │
│  ├── All functionality available via keyboard            │
│  ├── No content flashes more than 3 times/second         │
│  └── Language of page is identified in HTML              │
│                                                          │
│  Level AA (Target):                                      │
│  ├── Color contrast ratio ≥ 4.5:1 for normal text        │
│  ├── Color contrast ratio ≥ 3:1 for large text           │
│  ├── Text can be resized up to 200% without loss         │
│  ├── Focus indicators visible on all interactive elements│
│  └── Error identification and suggestions provided       │
│                                                          │
│  India-Specific Accessibility:                           │
│  ├── Large touch targets (min 48x48px) for rural users   │
│  ├── Voice-first interaction for non-literate users      │
│  ├── High contrast mode for outdoor/sunlight use         │
│  ├── Simple vocabulary (Class 5 reading level)           │
│  ├── Minimal text — use icons + colors extensively       │
│  └── Audio feedback for key actions                      │
└──────────────────────────────────────────────────────────┘
```

### 13.2 Accessible Component Patterns

```jsx
// Example: Accessible SchemeCard with ARIA
<article 
  role="article"
  aria-label={`${scheme.name_local} scheme. Benefit: ${scheme.benefit_amount}. 
               Eligibility: ${scheme.eligibility_score} percent match.`}
  tabIndex={0}
  className="scheme-card"
>
  <h3 id={`scheme-${scheme.id}-title`}>{scheme.name_local}</h3>
  
  {/* Eligibility score with both visual and text representation */}
  <div role="meter" 
       aria-valuenow={scheme.eligibility_score} 
       aria-valuemin={0} 
       aria-valuemax={100}
       aria-label={`Eligibility match: ${scheme.eligibility_score} percent`}>
    <div className="progress-bar" style={{width: `${scheme.eligibility_score}%`}} />
    <span className="sr-only">{scheme.eligibility_score}% match</span>
    <span aria-hidden="true">{scheme.eligibility_score}%</span>
  </div>
  
  {/* Document readiness with screen reader text */}
  <div aria-label={`Document readiness: ${scheme.doc_ready} out of ${scheme.doc_total} documents ready`}>
    <span aria-hidden="true">📋 {scheme.doc_ready}/{scheme.doc_total}</span>
  </div>
  
  <button 
    aria-describedby={`scheme-${scheme.id}-title`}
    onClick={() => onViewDetails(scheme.id)}
  >
    View Details
  </button>
</article>

// Example: Accessible Voice Recorder
<button
  role="switch"
  aria-checked={isRecording}
  aria-label={isRecording ? "Stop recording. Currently listening." : "Start voice recording. Tap and speak your question."}
  onClick={toggleRecording}
  className={`voice-btn ${isRecording ? 'recording' : ''}`}
>
  {isRecording ? '🔴 Listening...' : '🎤'}
</button>
```

### 13.3 Mobile-First Responsive Breakpoints

```css
/* Tailwind CSS breakpoints */
/* Default: Mobile (320px - 639px) — PRIMARY target */
/* sm: 640px — Large phones / small tablets */
/* md: 768px — Tablets */
/* lg: 1024px — Laptops */
/* xl: 1280px — Desktops */

/* Mobile-first: All styles default to mobile */
.scheme-card {
  @apply w-full p-4 rounded-lg shadow-md;           /* Mobile: full width */
  @apply sm:w-[48%];                                 /* Tablet: 2 columns */
  @apply lg:w-[32%];                                 /* Desktop: 3 columns */
}

.chat-container {
  @apply h-[calc(100vh-120px)];                      /* Mobile: full height minus header/input */
  @apply lg:h-[calc(100vh-80px)] lg:max-w-2xl lg:mx-auto;  /* Desktop: centered, max width */
}

/* Large touch targets for rural users */
.btn-primary {
  @apply min-h-[48px] min-w-[48px] text-lg px-6 py-3 rounded-xl;
  @apply active:scale-95 transition-transform;        /* Touch feedback */
}

/* Voice button — extra large on mobile */
.voice-btn {
  @apply w-16 h-16 rounded-full flex items-center justify-center;
  @apply text-2xl shadow-lg;
  @apply active:shadow-inner;
}
```

---

## 14. Monitoring & Observability

### 14.1 Application Metrics

```
┌──────────────────────────────────────────────────────────┐
│              METRICS TO TRACK                            │
│                                                          │
│  USAGE METRICS:                                          │
│  ├── Total sessions per day                              │
│  ├── Language distribution (% Hindi, English, etc.)      │
│  ├── Average session duration                            │
│  ├── Conversation completion rate (profile → schemes)    │
│  ├── Document upload usage rate                          │
│  ├── Voice input usage rate                              │
│  ├── Most searched scheme categories                     │
│  └── Scheme comparison usage rate                        │
│                                                          │
│  PERFORMANCE METRICS:                                    │
│  ├── API response times (P50, P95, P99)                  │
│  ├── LLM response latency                                │
│  ├── OCR processing time                                 │
│  ├── Frontend load time (Lighthouse)                     │
│  ├── Error rate per endpoint                             │
│  └── External API failure rate                           │
│                                                          │
│  QUALITY METRICS:                                        │
│  ├── Scheme matching accuracy (manual spot checks)       │
│  ├── OCR extraction accuracy                             │
│  ├── Profile extraction accuracy from conversation       │
│  ├── User satisfaction (optional feedback button)        │
│  └── Conversation length (questions asked before match)  │
│                                                          │
│  IMPACT METRICS (Future):                                │
│  ├── Number of schemes discovered per user               │
│  ├── Document readiness improvement over time            │
│  ├── Users returning for more scheme information         │
│  └── Geographic distribution of users                    │
└──────────────────────────────────────────────────────────┘
```

### 14.2 Logging Strategy

```python
# Logging configuration — NO personal data in logs

import logging

logger = logging.getLogger("jan_sahayak")

# WHAT WE LOG (anonymized):
logger.info("Chat request", extra={
    "session_id": "abc-123",          # Session ID (not user-identifiable)
    "language": "hi",                  # Language selected
    "conversation_phase": "profiling", # Current phase
    "response_time_ms": 1250,          # Performance metric
    "profile_completeness": 45         # % profile filled (not the actual data)
})

logger.info("Scheme match", extra={
    "session_id": "abc-123",
    "schemes_matched": 7,              # Count only, not user profile
    "top_scheme_category": "agriculture",
    "matching_time_ms": 2300
})

# WHAT WE NEVER LOG:
# ❌ User's name, age, income, or any profile data
# ❌ Chat messages content
# ❌ Document images or OCR text
# ❌ Aadhaar numbers (even masked)
# ❌ IP addresses (beyond standard access logs)
```

---

## 15. Environment Configuration

### 15.1 Environment Variables

```bash
# .env.example — Backend

# Application
APP_ENV=development                    # development | staging | production
APP_PORT=8000
APP_HOST=0.0.0.0
DEBUG=true

# OpenAI
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
OPENAI_MODEL=gpt-4o-mini              # LLM model for conversation
OPENAI_EMBEDDING_MODEL=text-embedding-3-small  # For vector embeddings
OPENAI_WHISPER_MODEL=whisper-1         # For speech-to-text

# Bhashini API (Indian Government Translation Service)
BHASHINI_API_KEY=xxxxxxxxxxxx
BHASHINI_USER_ID=xxxxxxxxxxxx
BHASHINI_ULCA_API_URL=https://meity-auth.ulcacontrib.org

# Google Cloud (Fallback)
GOOGLE_CLOUD_API_KEY=xxxxxxxxxxxx      # For Cloud Vision OCR fallback
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

# ChromaDB
CHROMA_PERSIST_DIR=./data/chroma_db
CHROMA_COLLECTION_NAME=government_schemes

# OCR
TESSERACT_CMD=/usr/bin/tesseract       # Path to Tesseract binary
OCR_LANGUAGES=eng+hin+tam+tel         # Supported OCR languages

# Security
ALLOWED_ORIGINS=http://localhost:5173,https://jan-sahayak.vercel.app
RATE_LIMIT_PER_MINUTE=60
MAX_UPLOAD_SIZE_MB=10
SESSION_TIMEOUT_MINUTES=30

# Feature Flags
ENABLE_VOICE_INPUT=true
ENABLE_VOICE_OUTPUT=true
ENABLE_DOCUMENT_UPLOAD=true
ENABLE_SCHEME_COMPARISON=true
ENABLE_MULTILINGUAL=true
```

```bash
# .env.example — Frontend

VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Jan Sahayak
VITE_ENABLE_VOICE=true
VITE_ENABLE_DOCUMENT_UPLOAD=true
VITE_MAX_UPLOAD_SIZE_MB=10
VITE_SUPPORTED_LANGUAGES=hi,en,ta,te,mr,bn,kn,gu,ml,pa,or
VITE_DEFAULT_LANGUAGE=hi
```

---

## 16. Dependency Management

### 16.1 Backend Dependencies (`requirements.txt`)

```
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
python-dotenv==1.0.0

# AI/LLM
openai==1.12.0

# Vector Database & Embeddings
chromadb==0.4.22
sentence-transformers==2.3.1

# OCR
Pillow==10.2.0
pytesseract==0.3.10

# Text-to-Speech
gTTS==2.5.0

# Translation
httpx==0.25.2                          # For Bhashini API calls

# Data Validation
pydantic==2.5.3
pydantic-settings==2.1.0

# Caching
cachetools==5.3.2

# Language Detection
langdetect==1.0.9

# Utilities
uuid6==2024.1.12
python-jose==3.3.0                     # JWT (future auth)

# Development
pytest==7.4.4
pytest-asyncio==0.23.3
httpx==0.25.2                          # Test client
black==23.12.1                         # Code formatter
ruff==0.1.11                           # Linter
```

### 16.2 Frontend Dependencies (`package.json`)

```json
{
  "name": "jan-sahayak-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext .js,.jsx",
    "test": "vitest",
    "test:ui": "vitest --ui"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.3",
    "zustand": "^4.5.0",
    "axios": "^1.6.5",
    "i18next": "^23.8.1",
    "react-i18next": "^14.0.1",
    "i18next-browser-languagedetector": "^7.2.0",
    "react-icons": "^5.0.1",
    "react-markdown": "^9.0.1",
    "framer-motion": "^11.0.3",
    "react-dropzone": "^14.2.3",
    "react-media-recorder": "^1.6.6",
    "browser-image-compression": "^2.0.2",
    "react-hot-toast": "^2.4.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "tailwindcss": "^3.4.1",
    "postcss": "^8.4.33",
    "autoprefixer": "^10.4.17",
    "eslint": "^8.56.0",
    "eslint-plugin-react": "^7.33.2",
    "vitest": "^1.2.2",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.3.0"
  }
}
```

---

## 17. Glossary of Technical Terms

| Term | Full Form | Description |
|---|---|---|
| **RAG** | Retrieval-Augmented Generation | AI technique that retrieves relevant data from a database before generating a response, reducing hallucination |
| **OCR** | Optical Character Recognition | Technology to extract text from images of documents |
| **LLM** | Large Language Model | AI models like GPT-4 that understand and generate human language |
| **STT** | Speech-to-Text | Converting spoken audio into written text |
| **TTS** | Text-to-Speech | Converting written text into spoken audio |
| **SSE** | Server-Sent Events | Protocol for streaming data from server to client in real-time |
| **SPA** | Single Page Application | Web app that loads a single HTML page and dynamically updates content |
| **CORS** | Cross-Origin Resource Sharing | Security mechanism that controls which domains can access the API |
| **ASGI** | Asynchronous Server Gateway Interface | Python interface for async web servers (used by FastAPI) |
| **CDN** | Content Delivery Network | Distributed servers that deliver static content from nearest location |
| **HSTS** | HTTP Strict Transport Security | Security header that forces HTTPS connections |
| **ChromaDB** | — | Open-source vector database for storing and searching embeddings |
| **FAISS** | Facebook AI Similarity Search | Library for efficient similarity search on vectors |
| **Zustand** | — | Lightweight React state management library (German for "state") |
| **Vite** | — | Modern JavaScript build tool and dev server (French for "fast") |
| **Bhashini** | — | Indian government's AI-powered language translation platform |
| **CSC** | Common Service Center | Government-authorized digital service delivery points across India |
| **UIDAI** | Unique Identification Authority of India | Government body managing Aadhaar |
| **BPL** | Below Poverty Line | Economic classification for welfare targeting |
| **APL** | Above Poverty Line | Economic classification |
| **AAY** | Antyodaya Anna Yojana | Category for the poorest of the poor |
| **PMKVY** | Pradhan Mantri Kaushal Vikas Yojana | Government skill development program |
| **eKYC** | Electronic Know Your Customer | Digital identity verification using Aadhaar |
| **DigiLocker** | — | Government digital document storage platform |
| **IVRS** | Interactive Voice Response System | Automated phone-based interaction system |

---



*This design document is prepared for the AI for Bharat Hackathon 

*Future Forward India — "Bridging government welfare to every citizen of Bharat"*
