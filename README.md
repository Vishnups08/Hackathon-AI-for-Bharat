# 🇮🇳 Jan Sahayak (जन सहायक)

### *Your AI Rights Enablement Assistant — Bridging the gap between government welfare and the citizens who deserve it.*

[![Project Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)](https://github.com/Team-Setu/Jan-Sahayak)
[![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI%20%2B%20LLM-blue)](https://github.com/Team-Setu/Jan-Sahayak)
[![Schemes](https://img.shields.io/badge/Schemes-30%2B%20Government%20Schemes-orange)](https://github.com/Team-Setu/Jan-Sahayak)
[![Languages](https://img.shields.io/badge/Languages-Hindi%20%2B%20English-purple)](https://github.com/Team-Setu/Jan-Sahayak)

---

## 🌟 The Problem

India allocates **₹14+ lakh crore annually** to 2,000+ welfare schemes, yet:

- **60% of rural Indians** are unaware of schemes they qualify for
- Only **13% of Indians** are comfortable using English for digital services
- An estimated **₹5.6 lakh crore** in welfare funds go unclaimed every year
- Existing portals like MyScheme.gov.in require form literacy and offer no document intelligence

**A farmer in Jharkhand loses ₹18,000/year in PM-KISAN benefits simply because he didn't know the scheme existed.**

---

## 💡 Our Solution

**Jan Sahayak** is an AI-powered, multilingual platform that helps Indian citizens discover government schemes through:

| Feature | Description |
|---|---|
| 🗣️ **Conversational Profile Building** | AI asks 5-7 simple questions in your language instead of complex forms |
| 📷 **Document Intelligence** | Upload Aadhaar/Ration Card → AI extracts data via OCR + LLM |
| 🎯 **Smart Scheme Matching** | Rule-based filtering + LLM scoring across 30+ schemes |
| 📋 **Document Readiness Scoring** | Know exactly which documents you have vs. need ("3/5 ready") |
| 📊 **Scheme Comparison** | AI compares schemes and recommends which to apply for first |
| 🌐 **Multilingual** | Full Hindi + English support with voice input |

---

## 📸 Screenshots

### Home Page
![localhost_5173-Jan Sahayak-cvscreenshot](https://github.com/user-attachments/assets/f96af634-d349-4361-9828-682609ebf18c)

### AI Chat Assistant
![localhost_5173-Jan Sahayak-cvscreenshot (1)](https://github.com/user-attachments/assets/06942b03-a54d-4c3a-ba84-4e5295f7a650)


### Schemes Discovery
![localhost_5173-Jan Sahayak-cvscreenshot (2)](https://github.com/user-attachments/assets/85fc87f4-ef32-4ca5-a3cf-3d24fead6b2e)


---

## 🏗️ Architecture

```
┌──────────────────────────────┐
│   REACT FRONTEND (Vite)      │
│   • Chat Interface           │
│   • Scheme Cards & Details   │
│   • Document Upload          │
│   • Scheme Comparison        │
│   • Hindi/English Toggle     │
└──────────────┬───────────────┘
               │ REST API (JSON)
┌──────────────▼───────────────┐
│   FASTAPI BACKEND (Python)   │
│   • Conversation Engine      │
│   • Document Intelligence    │
│   • Scheme Matching Engine   │
│   • Voice STT/TTS            │
└──────────────┬───────────────┘
               │
┌──────────────▼───────────────┐
│   AI & DATA LAYER            │
│   • LLM (via OpenRouter)     │
│   • OCR + Vision Analysis    │
│   • 30+ Schemes Database     │
│   • Rule-based Filters       │
└──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI Framework |
| Vite 4 | Build Tool |
| Tailwind CSS 3 | Styling |
| Zustand 5 | State Management |
| Framer Motion 12 | Animations |
| React Router 7 | Routing |
| Axios | HTTP Client |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.11+ | Backend Language |
| FastAPI | Web Framework (async) |
| Uvicorn | ASGI Server |
| OpenRouter API | LLM Access (GPT-4o / Gemini / Llama) |
| Pydantic | Data Validation |
| httpx | Async HTTP Client |
| Mangum | AWS Lambda Adapter |
| boto3 | AWS Services (Textract, Polly, Transcribe) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** ≥ 18.x
- **Python** ≥ 3.11
- **npm** or **yarn**
- An **OpenRouter API key** ([get one here](https://openrouter.ai/))

### 1. Clone the repository
```bash
git clone https://github.com/Team-Setu/Jan-Sahayak.git
cd Jan-Sahayak
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Start the server
uvicorn app.main:app --reload
```
The API will be running at `http://localhost:8000`. View API docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
The app will be running at `http://localhost:5173`.

### 4. Environment Variables

**Backend** (`backend/.env`):
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
LLM_MODEL_ID=google/gemini-2.0-flash-001
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

---

## 📋 Scheme Database

Jan Sahayak includes **30+ real Indian government schemes** across 7 categories:

| Category | Schemes | Examples |
|---|---|---|
| 🌾 Agriculture | 6 | PM-KISAN, Fasal Bima, Kisan Credit Card |
| 🏥 Health | 5 | Ayushman Bharat, Janani Suraksha |
| 📚 Education | 5 | Vidya Lakshmi, Skill India, Beti Bachao |
| 🏠 Housing | 3 | PM Awas Yojana (Urban + Rural) |
| 💰 Financial | 5 | MUDRA Yojana, Stand-Up India, Jan Dhan |
| 👴 Social Security | 4 | Atal Pension, PM Shram Yogi Maan-Dhan |
| 👩 Women & Child | 3 | Sukanya Samriddhi, Matru Vandana |

Each scheme includes: eligibility criteria, benefit details, required documents, application steps (online + offline), helpline numbers, and official portal links.

---

## 🔑 Key Innovations

### 1. Document-to-Eligibility Pipeline
Upload a photo of your Aadhaar card → AI extracts your name, age, address, gender via OCR + LLM → Instantly calculates eligibility across 30+ schemes. **No existing solution does this.**

### 2. Document Readiness Scoring
For each scheme, see exactly how many documents you have vs. need:
```
PM-KISAN — Document Readiness: 3/5 (60%)
✅ Aadhaar Card — Available (uploaded)
✅ Bank Account — Available (from chat)  
✅ Mobile Number — Available
❌ Land Records — Visit Patwari Office (3-7 days)
❌ Income Certificate — Apply at CSC Center (7-15 days)
```

### 3. Conversational Profile Building
No forms. No 20+ fields. Just a natural conversation in your language.

### 4. AI Scheme Comparison
Compare 2-3 schemes side-by-side with personalized AI recommendation on which to apply first.

---

## 🛡️ Privacy & Security

- **No persistent data storage** — All data is session-based
- **Aadhaar numbers masked** — Only last 4 digits shown (XXXX-XXXX-1234)
- **Documents processed in-memory** — Never saved to disk
- **API keys server-side only** — Never exposed to frontend
- **No login required** — Zero-friction access

---

## 🗺️ Roadmap

| Phase | Features |
|---|---|
| ✅ Phase 1 (Current) | Web app, conversational AI, 30+ schemes, document upload, Hindi + English |
| 🔜 Phase 2 | WhatsApp bot integration, RAG-based semantic search |
| 📋 Phase 3 | 10+ Indian languages, voice-first interaction, IVRS for feature phones |
| 🌍 Phase 4 | State-specific scheme databases for all 28 states + 8 UTs |

---

## 📁 Project Structure

```
Jan-Sahayak/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Layout, IndiaMap, ScrollAnimation
│   │   ├── pages/            # Home, Chat, SchemesList, SchemeDetail, CompareSchemes
│   │   ├── stores/           # Zustand state management
│   │   ├── lib/              # API client (Axios)
│   │   └── assets/           # Logo, images
│   └── package.json
│
├── backend/                  # Python FastAPI backend
│   ├── app/
│   │   ├── api/routes/       # chat, document, schemes, voice, health
│   │   ├── core/             # LLM client (OpenRouter)
│   │   ├── data/schemes/     # 7 JSON files with 30+ schemes
│   │   ├── prompts/          # LLM system prompts
│   │   └── config.py         # Environment configuration
│   └── requirements.txt
│
├── docs/                     # Documentation & screenshots
├── design.md                 # Detailed architecture design document
├── requirements.md           # Full requirements & user stories
└── README.md                 # This file
```

---

## 👥 Team — Future Forward India

Dedicated to bridging the gap between digital governance and the last-mile citizen.

---

## 📜 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <strong>🇮🇳 Jan Sahayak — Because every citizen deserves to know their rights.</strong>
</p>

