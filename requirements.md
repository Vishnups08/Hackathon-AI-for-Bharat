# Requirements Document — Jan Sahayak (जन सहायक)
## AI-Powered Government Scheme Eligibility & Guidance Platform

---
## 1. Project Overview

### 1.1 Project Title
**Jan Sahayak (जन सहायक)** — AI-Powered Voice-First Government Scheme Eligibility Assistant

### 1.2 Team Name
Team Setu

### 1.3 Problem Statement
**Problem Statement 3:** Build an AI-powered solution that improves access to information, resources, or opportunities for communities and public systems.

### 1.4 Tagline
*"Your AI Rights Enablement Assistant — Bridging the gap between government welfare and the citizens who deserve it"*

---

## 2. Problem Description

### 2.1 The Core Problem
India allocates **₹14+ lakh crore annually** to welfare schemes across 2,000+ central and state government programs. Despite this massive investment, a significant portion of eligible citizens — particularly in rural and semi-urban India — never access the benefits they are legally entitled to.

### 2.2 Why This Problem Exists

#### 2.2.1 Awareness Gap
- **60% of rural Indians** are unaware of government schemes they qualify for (NCAER Study)
- India has **2,000+ schemes** across central and state governments — impossible for any citizen to navigate manually
- Scheme names, eligibility criteria, and benefits change frequently
- Information is scattered across multiple government websites, portals, and offices

#### 2.2.2 Language Barrier
- Only **13% of Indians** are comfortable using English for digital services
- Most government portals and scheme information is available primarily in English and Hindi
- India has **22 officially recognized languages** and **hundreds of dialects**
- A Tamil-speaking farmer cannot navigate an English government portal

#### 2.2.3 Complexity Barrier
- Eligibility criteria involve multiple parameters: age, income, caste category, occupation, land holding, state, gender, family size, BPL status, etc.
- Each scheme has different document requirements
- Application processes vary — some online, some offline, some through CSC, some through banks
- Citizens don't know WHICH documents they already have vs. which they need to obtain

#### 2.2.4 Digital Literacy Barrier
- Only **50 crore out of 130 crore Indians** use smartphones
- Rural internet penetration is still limited
- Many target beneficiaries cannot read or write
- Filling online forms is impossible for a large population segment

### 2.3 The Real-World Impact
- A farmer in Jharkhand loses ₹18,000/year in PM-KISAN benefits because he didn't know the scheme existed
- A widow in rural Rajasthan misses out on pension benefits because she cannot navigate the application portal
- A young woman in UP doesn't start her business because she's unaware of MUDRA loan availability
- **Estimated ₹5.6 lakh crore** in welfare funds go unclaimed or mis-targeted every year

### 2.4 Why Existing Solutions Fail

| Existing Solution | What It Does | Why It Fails |
|---|---|---|
| MyScheme.gov.in | Government scheme portal with form-based eligibility checker | English/Hindi only, requires digital literacy, form-based (20+ fields), not conversational, no document intelligence |
| UMANG App | Unified government services app | Requires app download, complex navigation, not AI-powered, no personalized recommendations |
| CSC Centers | Physical Common Service Centers | Requires physical visit, limited hours, long queues, dependent on operator knowledge, 3.5 lakh centers for 130 crore people |
| Google/YouTube | General information search | Scattered information, not personalized, overwhelming results, no eligibility verification, potential misinformation |
| Generic ChatGPT | General-purpose AI chatbot | No curated Indian scheme database, hallucination risk on eligibility criteria, not designed for low-literacy users, English-centric |
| Government Helplines | Phone-based information | Long wait times, limited hours, human operator limitations, no document analysis capability |

---

## 3. Proposed Solution

### 3.1 Solution Overview
Jan Sahayak is an **AI-powered, multilingual web application** that enables any Indian citizen to discover government schemes they are eligible for through:

1. **Conversational Profile Building** — AI asks simple natural language questions instead of complex forms
2. **Document Intelligence** — Upload photos of documents (Aadhaar, Ration Card) and AI automatically extracts profile data
3. **Intelligent Scheme Matching** — RAG-based engine matches user profile against a curated database of 100+ government schemes
4. **Document Readiness Scoring** — AI tells users not just which schemes they're eligible for, but which documents they already have and which they still need
5. **Scheme Comparison** — AI compares and recommends the most beneficial schemes for the user's specific situation
6. **Multilingual Support** — Works in Hindi, English, Tamil, Telugu, Marathi, Bengali, Kannada, Gujarati, Malayalam, Punjabi, and Odia

### 3.2 Four Key Innovations

####  INNOVATION 1: Document-to-Eligibility Pipeline
**What:** User uploads a photo of their Aadhaar card, Ration Card, or Income Certificate → AI uses OCR + LLM to extract structured data (name, age, address, income, category) → Instantly calculates scheme eligibility across 100+ schemes.

**Why it's innovative:** No existing solution converts a document photo into instant eligibility results. This eliminates the need for users to manually enter data they may not even know (like exact income brackets or category classifications).

**Technical approach:**
- OCR engine extracts raw text from document image
- LLM parses unstructured OCR output into structured profile data
- Profile data feeds into scheme matching engine
- Results generated in under 10 seconds

#### INNOVATION 2: Document Readiness Scoring
**What:** For each eligible scheme, Jan Sahayak shows a **document readiness score** — how many of the required documents the user already has (based on uploads or conversation) vs. how many they still need to obtain, with specific guidance on WHERE to get each missing document.

**Example output:**
```
PM-KISAN Samman Nidhi — Document Readiness: 3/5 (60%)
✅ Aadhaar Card — Available (uploaded)
✅ Bank Account Details — Available (mentioned in conversation)
✅ Mobile Number — Available
❌ Land Ownership Record — Missing
   → Visit your local Patwari/Tehsildar office to obtain
   → Estimated time: 3-7 working days
❌ Income Certificate — Missing
   → Apply at District Collectorate or through CSC
   → Estimated time: 7-15 working days
```

**Why it's innovative:** No existing solution tells users the gap between what they have and what they need. This converts a vague "you might be eligible" into an actionable "here's exactly what to do next."

#### 🌟 INNOVATION 3: Conversational Profile Building
**What:** Instead of requiring users to fill out forms with 20+ fields (like MyScheme.gov.in), Jan Sahayak uses a conversational AI approach. The AI asks 5-7 simple natural language questions, understands responses in the user's language, and extracts all necessary profile parameters.

**Example conversation:**
```
AI: "Namaste! Aapka naam kya hai?"
User: "Ramesh"
AI: "Ramesh ji, aapki umar kitni hai?"
User: "45 saal"
AI: "Aap kya kaam karte hain?"
User: "Main kisan hoon, mere paas 2 beegha zameen hai"
AI: "Aap kis state se hain?"
User: "Madhya Pradesh, Sagar district"
AI: "Aapki family mein kitne log hain aur saalana income lagbhag kitni hai?"
User: "5 log hain, income lagbhag 1.5 lakh"

→ AI extracts: {name: "Ramesh", age: 45, occupation: "farmer", 
   land_holding: "0.6 hectares", state: "Madhya Pradesh", 
   district: "Sagar", family_size: 5, annual_income: 150000}
```

**Why it's innovative:** Conversational data collection is natural, requires no form literacy, works with voice input, and can handle messy/partial inputs gracefully through follow-up questions.

#### 🌟 INNOVATION 4: Scheme Comparison & Recommendation
**What:** When multiple schemes are relevant, Jan Sahayak doesn't just list them — it **compares and recommends** based on the user's specific situation, explaining which scheme provides the most immediate benefit and why.

**Example output:**
```
Based on your profile, here are your top 3 schemes compared:

1. PM-KISAN Samman Nidhi
   💰 Benefit: ₹6,000/year (guaranteed cash transfer)
   📋 Documents Ready: 3/5
   ⏱️ Time to Apply: ~2 weeks
   ⭐ Recommendation: APPLY FIRST — immediate cash benefit, 
      fewer documents needed

2. PM Fasal Bima Yojana
   💰 Benefit: Crop insurance (covers crop loss)
   📋 Documents Ready: 2/5
   ⏱️ Time to Apply: ~1 month (seasonal enrollment)
   ⭐ Recommendation: Apply before Kharif season starts

3. Kisan Credit Card
   💰 Benefit: Low-interest crop loan up to ₹3 lakh
   📋 Documents Ready: 3/6
   ⏱️ Time to Apply: ~3 weeks
   ⭐ Recommendation: Good for next season planning
```

**Why it's innovative:** No existing solution compares schemes head-to-head and provides prioritized recommendations. This helps citizens make informed decisions about which benefits to pursue first.

---

## 4. Target Users

### 4.1 Primary Users

#### 4.1.1 Rural Citizens
- **Demographics:** Farmers, laborers, daily wage workers, small artisans
- **Characteristics:** Limited digital literacy, primarily local language speakers, basic smartphone users or feature phone users
- **Pain points:** Unaware of schemes, cannot navigate government portals, don't know document requirements
- **How Jan Sahayak helps:** Voice-first conversation in local language, document upload eliminates form-filling, step-by-step guidance

#### 4.1.2 Semi-Urban Residents
- **Demographics:** Small shopkeepers, auto drivers, domestic workers, construction workers
- **Characteristics:** Basic smartphone users, can use WhatsApp, some English understanding
- **Pain points:** Know some schemes exist but unsure of eligibility, confused by application processes
- **How Jan Sahayak helps:** Quick eligibility check, document readiness scoring, scheme comparison

#### 4.1.3 Women and Senior Citizens
- **Demographics:** Homemakers, widows, elderly persons, single mothers
- **Characteristics:** Often dependent on family members for information access, face additional barriers
- **Pain points:** Women-specific and senior-specific schemes are under-accessed, social barriers to visiting government offices
- **How Jan Sahayak helps:** Access from home, gender/age-specific scheme filtering, simple interaction

### 4.2 Secondary Users

#### 4.2.1 Community Workers & CSC Operators
- **Demographics:** 3.5 lakh CSC operators, panchayat members, ASHA workers, NGO field workers
- **Pain points:** Need to serve many citizens quickly, cannot remember eligibility criteria for all schemes
- **How Jan Sahayak helps:** Rapid eligibility checking tool, bulk profile assessment, document checklist generation

#### 4.2.2 Government Officials
- **Demographics:** Block-level officers, district collectors, scheme implementation officers
- **Pain points:** Low scheme adoption rates, difficulty reaching eligible beneficiaries
- **How Jan Sahayak helps:** Can be used as an outreach tool, analytics on scheme demand patterns (future scope)

---

## 5. Functional Requirements

### FR-1: User Onboarding & Language Selection
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-1.1 | Language selection on first visit | P0 | Support minimum Hindi + English at MVP. Display language options with native script names (हिंदी, English, தமிழ், తెలుగు, etc.) |
| FR-1.2 | Auto-detect browser/device language | P1 | Set default language based on browser language settings |
| FR-1.3 | Language switch at any point | P1 | User can change language mid-conversation without losing context |
| FR-1.4 | Welcome message in selected language | P0 | Warm, simple welcome message explaining what Jan Sahayak does |

### FR-2: Conversational Profile Building
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-2.1 | AI-driven conversational Q&A | P0 | AI asks 5-7 simple questions to collect user profile. Questions adapt based on previous answers (e.g., if user says "farmer", ask about land holding) |
| FR-2.2 | Natural language understanding | P0 | Understand responses in Hindi, English, and mixed language (Hinglish). Extract structured data from unstructured responses |
| FR-2.3 | Profile parameters extraction | P0 | Extract: age, gender, state, district, occupation, annual income, caste category (SC/ST/OBC/General), education level, family size, land holding, BPL status, marital status |
| FR-2.4 | Graceful handling of incomplete data | P1 | If user doesn't know exact income, accept ranges ("1-2 lakh"). If user skips a question, mark as unknown and still provide partial matching |
| FR-2.5 | Profile summary confirmation | P0 | Show extracted profile summary and ask user to confirm before matching. Allow corrections |
| FR-2.6 | Profile edit capability | P1 | User can modify any profile parameter after initial collection |

### FR-3: Document Upload & Intelligence (Innovation 1)
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-3.1 | Document photo upload | P0 | Accept camera capture or gallery upload of document photos. Support JPEG, PNG, PDF formats. Max file size: 10MB |
| FR-3.2 | Supported document types | P0 | MVP: Aadhaar Card (front & back), Ration Card. Future: Income Certificate, Caste Certificate, Land Records, PAN Card, Voter ID |
| FR-3.3 | OCR text extraction | P0 | Extract text from document images using OCR engine. Handle: multiple Indian scripts, poor image quality, tilted/rotated images, partial visibility |
| FR-3.4 | LLM-powered data parsing | P0 | Use LLM to parse unstructured OCR text into structured profile data. Extract: name, date of birth, gender, address (state, district), document number (masked for privacy), family members (from ration card), category (from ration card — APL/BPL/AAY) |
| FR-3.5 | Auto-profile update | P0 | Automatically update user profile with extracted document data. Show user what was extracted and ask for confirmation |
| FR-3.6 | Document type auto-detection | P1 | AI identifies whether uploaded document is Aadhaar, Ration Card, etc. without user specifying |
| FR-3.7 | Privacy safeguards | P0 | Mask sensitive numbers (Aadhaar number) in display. Do not store document images permanently. Process in-memory and discard |

### FR-4: Scheme Matching Engine
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-4.1 | Rule-based eligibility filtering | P0 | Filter schemes based on hard eligibility criteria: age range, income limit, occupation match, state availability, gender requirements, category requirements |
| FR-4.2 | RAG-based semantic matching | P0 | Use vector similarity search to find schemes relevant to user's natural language query or described situation. Combine with rule-based results |
| FR-4.3 | LLM-powered eligibility reasoning | P0 | For edge cases, use LLM to reason about eligibility. Example: User has 0.6 hectares → LLM determines this qualifies as "marginal farmer" for PM-KISAN |
| FR-4.4 | Eligibility confidence scoring | P1 | For each matched scheme, show confidence: "Highly Likely Eligible (95%)" vs "Possibly Eligible (70%) — verify income criteria" |
| FR-4.5 | Ranked recommendations | P0 | Rank matched schemes by: benefit amount, document readiness, relevance to user's stated needs |
| FR-4.6 | Category-based filtering | P1 | Allow filtering by scheme category: Agriculture, Health, Education, Housing, Employment, Women & Child, Pension, Financial Inclusion |
| FR-4.7 | Minimum 30 schemes in database | P0 | MVP must include at least 30 well-documented central government schemes across major categories |

### FR-5: Document Readiness Scoring (Innovation 2)
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-5.1 | Document checklist per scheme | P0 | For each eligible scheme, display complete list of required documents |
| FR-5.2 | Readiness score calculation | P0 | Calculate: documents user has (uploaded or mentioned) vs. total required. Display as fraction and percentage: "3/5 documents ready (60%)" |
| FR-5.3 | Missing document identification | P0 | Clearly identify which specific documents are missing |
| FR-5.4 | Document procurement guidance | P1 | For each missing document, provide: where to obtain it (specific office name), estimated time to obtain, any fees involved, alternative accepted documents |
| FR-5.5 | Readiness-based prioritization | P1 | Schemes where user has more documents ready should be ranked higher (easier to apply) |

### FR-6: Scheme Comparison (Innovation 4)
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-6.1 | Side-by-side scheme comparison | P1 | Compare 2-3 schemes on: benefit amount, document readiness, application complexity, time to benefit |
| FR-6.2 | AI-powered recommendation | P0 | LLM generates personalized recommendation explaining which scheme to apply for first and why, based on user's specific situation |
| FR-6.3 | Priority ordering | P0 | Suggest application order: "Apply for Scheme A first (more documents ready, faster benefit), then Scheme B" |

### FR-7: Scheme Detail View
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-7.1 | Comprehensive scheme information | P0 | Display: scheme name (English + local language), description in simple language, eligibility criteria, benefit details (amount, frequency, type), required documents with readiness status |
| FR-7.2 | Step-by-step application guide | P0 | Numbered steps for how to apply. Include both online and offline methods. Mention specific portals, offices, or CSC options |
| FR-7.3 | Official links | P0 | Direct link to official scheme portal |
| FR-7.4 | Helpline numbers | P1 | Scheme-specific helpline or toll-free number |
| FR-7.5 | Nearest facility locator | P2 | Show nearest CSC center or relevant government office based on user's district |

### FR-8: Multilingual Chat & Q&A
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-8.1 | Natural language Q&A | P0 | User can ask any question about any scheme in natural language. AI responds with accurate, sourced information |
| FR-8.2 | Context-aware follow-ups | P0 | AI maintains conversation context. User can say "tell me more about the first one" or "what about for my wife?" without re-explaining |
| FR-8.3 | Multi-turn conversation | P0 | Support extended conversations with context memory across multiple exchanges |
| FR-8.4 | Hallucination prevention | P0 | For eligibility criteria, benefit amounts, and document requirements, AI must ONLY use information from the curated scheme database. Never generate unverified scheme information |
| FR-8.5 | Out-of-scope handling | P1 | For questions outside Jan Sahayak's scope, provide graceful response with alternative suggestions (helpline numbers, relevant websites) |
| FR-8.6 | Hindi + English at MVP | P0 | Full conversational support in Hindi and English minimum |
| FR-8.7 | Additional languages | P2 | Tamil, Telugu, Marathi, Bengali, Kannada, Gujarati, Malayalam, Punjabi, Odia support via translation layer |

### FR-9: Voice Interaction
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-9.1 | Voice input (Speech-to-Text) | P1 | User can tap microphone button and speak instead of typing. Support Hindi and English voice input at MVP |
| FR-9.2 | Voice output (Text-to-Speech) | P2 | AI responses can be played as audio. Support Hindi and English at MVP |
| FR-9.3 | Language auto-detection from voice | P2 | Detect spoken language automatically and set conversation language accordingly |

### FR-10: User Interface
| ID | Requirement | Priority | Details |
|---|---|---|---|
| FR-10.1 | React-based responsive web app | P0 | Built with React.js. Mobile-first responsive design. Works on all modern browsers |
| FR-10.2 | Chat-based primary interface | P0 | WhatsApp-like chat interface as the main interaction mode. Message bubbles for user and AI |
| FR-10.3 | Scheme recommendation cards | P0 | Visual cards showing scheme name, benefit amount, eligibility match score, document readiness score, and "View Details" action |
| FR-10.4 | Document upload interface | P0 | Camera capture button + file upload. Image preview before submission. Processing indicator during OCR |
| FR-10.5 | Accessibility design | P1 | Large touch targets (minimum 48x48px), high contrast text, large font sizes, minimal text where possible, icon-based navigation |
| FR-10.6 | Low bandwidth optimization | P1 | Lazy loading of components, compressed images, minimal JavaScript bundle size, text-first rendering |
| FR-10.7 | Dark mode support | P2 | Optional dark mode toggle |

---

## 6. Non-Functional Requirements

### NFR-1: Performance
| ID | Requirement | Target |
|---|---|---|
| NFR-1.1 | Chat response latency | < 3 seconds for text responses |
| NFR-1.2 | Document OCR processing | < 10 seconds for single document |
| NFR-1.3 | Scheme matching | < 5 seconds for full profile matching |
| NFR-1.4 | Voice transcription | < 5 seconds for 30-second audio |
| NFR-1.5 | Initial page load | < 3 seconds on 3G connection |
| NFR-1.6 | Concurrent users | Support 100 concurrent users |

### NFR-2: Accuracy
| ID | Requirement | Target |
|---|---|---|
| NFR-2.1 | Scheme eligibility matching | > 85% accuracy |
| NFR-2.2 | Document OCR extraction | > 80% accuracy for clean documents, > 60% for poor quality |
| NFR-2.3 | Profile extraction from conversation | > 90% accuracy for supported languages |
| NFR-2.4 | Zero tolerance for hallucinated scheme data | 100% — all scheme data must come from curated database |
| NFR-2.5 | Language understanding accuracy | > 85% for Hindi and English |

### NFR-3: Security & Privacy
| ID | Requirement | Details |
|---|---|---|
| NFR-3.1 | No persistent personal data storage | All user data is session-based. Cleared when user closes browser |
| NFR-3.2 | No Aadhaar number storage | Aadhaar numbers extracted via OCR are masked immediately (XXXX-XXXX-1234) and never stored |
| NFR-3.3 | Document image handling | Document images are processed in-memory. Not saved to disk or database. Discarded after OCR processing |
| NFR-3.4 | HTTPS encryption | All client-server communication over HTTPS |
| NFR-3.5 | API key security | All API keys stored in environment variables. Never exposed to client-side code |
| NFR-3.6 | Input sanitization | All user inputs sanitized to prevent prompt injection attacks |
| NFR-3.7 | Rate limiting | API rate limiting to prevent abuse (max 60 requests/minute per session) |

### NFR-4: Accessibility & Inclusivity
| ID | Requirement | Details |
|---|---|---|
| NFR-4.1 | Mobile-first design | Primary design target: Android smartphones with 5-6 inch screens |
| NFR-4.2 | Low bandwidth support | Core functionality works on 2G connections (< 256 kbps) |
| NFR-4.3 | No login required | Zero-friction access. No signup, no login, no OTP |
| NFR-4.4 | Minimal text UI | Use icons, colors, and visual indicators wherever possible to reduce reading requirement |
| NFR-4.5 | Screen reader compatibility | Basic ARIA labels for key interactive elements |
| NFR-4.6 | Offline guidance | If connection drops, show last fetched scheme details from local cache |

### NFR-5: Scalability
| ID | Requirement | Details |
|---|---|---|
| NFR-5.1 | Modular scheme database | New schemes can be added by adding JSON entries without code changes |
| NFR-5.2 | Pluggable language support | New languages can be added by updating translation configuration |
| NFR-5.3 | API-first backend | Backend exposes REST APIs that can be consumed by future WhatsApp bot, IVRS system, or mobile app |
| NFR-5.4 | Stateless architecture | No server-side session storage. All context maintained in client or passed with each request |
| NFR-5.5 | Horizontal scalability | Backend can be deployed across multiple instances behind a load balancer |

### NFR-6: Reliability
| ID | Requirement | Details |
|---|---|---|
| NFR-6.1 | Graceful degradation | If OCR fails, fall back to manual input. If voice fails, fall back to text. If LLM fails, show cached scheme data |
| NFR-6.2 | Error handling | User-friendly error messages in selected language. No technical error codes shown to users |
| NFR-6.3 | Uptime target | 99% uptime for deployed application |

---

## 7. User Stories

### US-1: Rural Farmer Discovering Schemes via Conversation
**As a** 45-year-old farmer in rural Madhya Pradesh who speaks Hindi and has limited digital literacy,
**I want to** have a simple Hindi conversation with an AI assistant about my situation,
**So that** I can discover all government schemes I'm eligible for without filling complex forms.

**Acceptance Criteria:**
- [ ] I can select Hindi as my language on the first screen
- [ ] AI asks me simple questions I can understand (age, occupation, state, income, family)
- [ ] I can answer naturally: "Main kisan hoon, 2 beegha zameen hai"
- [ ] AI correctly extracts: occupation=farmer, land=~0.6 hectares
- [ ] AI shows me a list of relevant schemes with eligibility scores
- [ ] Each scheme shows benefit amount in simple terms: "₹6,000 har saal milenge"
- [ ] I don't need to fill any form or type any complex information

### US-2: Citizen Using Document Upload for Instant Eligibility
**As a** semi-urban resident who has an Aadhaar card and smartphone,
**I want to** upload a photo of my Aadhaar card and instantly see which schemes I qualify for,
**So that** I can skip the question-answer process and get results immediately.

**Acceptance Criteria:**
- [ ] I can tap a "Upload Document" button and capture photo or select from gallery
- [ ] AI shows "Processing your document..." with progress indicator
- [ ] Within 10 seconds, AI shows extracted data: name, age, gender, address
- [ ] AI asks me to confirm extracted data and fill any gaps (occupation, income)
- [ ] Scheme matching runs automatically after profile is complete
- [ ] Aadhaar number is masked (XXXX-XXXX-1234) in all displays

### US-3: Checking Document Readiness for a Specific Scheme
**As a** user who has been shown eligible schemes,
**I want to** see exactly which documents I have and which I'm missing for a specific scheme,
**So that** I know precisely what to arrange before applying.

**Acceptance Criteria:**
- [ ] Each scheme card shows document readiness: "3/5 documents ready"
- [ ] When I click on a scheme, I see full document checklist
- [ ] Documents I have show green checkmark ✅
- [ ] Missing documents show red cross ❌ with where to get them
- [ ] Missing document guidance includes: office name, estimated time, any fees
- [ ] I can see which scheme has the most documents ready (easiest to apply)

### US-4: Comparing Multiple Schemes
**As a** user eligible for multiple schemes,
**I want to** see a comparison of my top schemes with AI recommendation on which to apply first,
**So that** I can make the best decision about where to start.

**Acceptance Criteria:**
- [ ] AI shows top 3-5 schemes in a comparison view
- [ ] Comparison includes: benefit amount, document readiness, application complexity
- [ ] AI provides a clear recommendation: "Apply for PM-KISAN first because..."
- [ ] Reasoning is personalized to my situation (not generic)
- [ ] I can ask follow-up questions about the comparison

### US-5: Community Worker Serving Multiple Citizens
**As a** CSC operator helping citizens in my village,
**I want to** quickly check scheme eligibility for different people who visit my center,
**So that** I can serve more people efficiently with accurate information.

**Acceptance Criteria:**
- [ ] I can start a new session easily for each citizen
- [ ] Profile collection is quick (under 2 minutes)
- [ ] I can see all eligible schemes with document checklists
- [ ] I can show the citizen the results in their language
- [ ] Previous session data does not leak to new sessions

### US-6: Senior Citizen Seeking Pension Information via Voice
**As a** 68-year-old retired person who cannot type easily,
**I want to** speak to the AI assistant in Hindi about pension schemes,
**So that** I can find pension benefits available for me without typing.

**Acceptance Criteria:**
- [ ] Microphone button is large and prominent
- [ ] I can speak my question and AI understands it
- [ ] AI responds both in text and audio (so I can listen)
- [ ] Senior-citizen specific schemes (pension, health) are prioritized
- [ ] Interface has large text and buttons that are easy to tap

### US-7: Woman Seeking Self-Employment Support
**As a** 28-year-old woman in a semi-urban area looking to start a business,
**I want to** find women-specific government schemes for entrepreneurship and loans,
**So that** I can access financial support and training to start my business.

**Acceptance Criteria:**
- [ ] When I mention I'm a woman looking for business support, AI prioritizes women-specific schemes
- [ ] MUDRA loan, Stand-Up India, and similar schemes are recommended
- [ ] Both loan schemes and training/skill development schemes are shown
- [ ] AI explains loan terms in simple language (interest rate, repayment)
- [ ] Document readiness shows what I need for loan application

---

## 8. Scheme Database Requirements

### 8.1 Minimum Scheme Coverage (MVP — 30+ schemes)

#### Agriculture & Farming (6+ schemes)
1. PM-KISAN Samman Nidhi — ₹6,000/year cash transfer for farmers
2. PM Fasal Bima Yojana — Crop insurance scheme
3. Kisan Credit Card (KCC) — Low-interest agricultural credit
4. Soil Health Card Scheme — Free soil testing and recommendations
5. PM Krishi Sinchai Yojana — Irrigation support
6. National Mission for Sustainable Agriculture — Climate-resilient farming support

#### Health & Medical (5+ schemes)
7. Ayushman Bharat (PM-JAY) — ₹5 lakh/year health insurance
8. Janani Suraksha Yojana — Maternity benefit
9. PM Jan Arogya Yojana — Health coverage for BPL families
10. Rashtriya Swasthya Bima Yojana — Health insurance for unorganized sector
11. PM National Dialysis Programme — Free dialysis services

#### Education & Skill Development (5+ schemes)
12. PM Vidya Lakshmi — Education loan portal
13. National Scholarship Portal — Multiple scholarships
14. Skill India / PMKVY — Free skill training with certificate
15. Digital India — Digital literacy programs
16. Beti Bachao Beti Padhao — Girl child education support

#### Housing (3+ schemes)
17. PM Awas Yojana (Gramin) — Rural housing subsidy
18. PM Awas Yojana (Urban) — Urban housing subsidy
19. Indira Awaas Yojana — Housing for BPL families

#### Financial Inclusion & Employment (5+ schemes)
20. PM Mudra Yojana — Loans up to ₹10 lakh for small businesses
21. Stand-Up India — Loans for SC/ST and women entrepreneurs
22. PM Rozgar Protsahan Yojana — Employment incentive
23. Jan Dhan Yojana — Zero-balance bank account with insurance
24. Atal Pension Yojana — Pension for unorganized sector

#### Social Security & Pension (4+ schemes)
25. PM Shram Yogi Maan-Dhan — Pension for unorganized workers
26. PM Kisan Maan-Dhan — Pension for farmers
27. National Social Assistance Programme — Pension for elderly/widows/disabled
28. PM Jeevan Jyoti Bima Yojana — Life insurance at ₹330/year

#### Women & Child Development (3+ schemes)
29. Sukanya Samriddhi Yojana — Savings scheme for girl child
30. PM Matru Vandana Yojana — ₹5,000 maternity benefit
31. Mahila Shakti Kendra — Women empowerment services

### 8.2 Scheme Data Fields
For each scheme, the following data must be maintained:

```json
{
  "scheme_id": "string — unique identifier",
  "name_en": "string — English name",
  "name_hi": "string — Hindi name",
  "name_local": {
    "ta": "Tamil name",
    "te": "Telugu name"
  },
  "ministry": "string — responsible ministry",
  "categories": ["array of category tags"],
  "description_en": "string — simple English description (2-3 sentences)",
  "description_hi": "string — simple Hindi description",
  "eligibility": {
    "age_min": "number or null",
    "age_max": "number or null",
    "gender": "all | male | female",
    "income_max_annual": "number or null",
    "occupation": ["array of eligible occupations or 'all'"],
    "category": ["SC", "ST", "OBC", "General" or "all"],
    "states": ["array of applicable states or 'all'"],
    "is_bpl_required": "boolean",
    "land_holding_max_hectares": "number or null",
    "additional_criteria": "string — any other criteria in plain text"
  },
  "benefits": {
    "type": "cash_transfer | insurance | loan | subsidy | service | training",
    "amount": "string — benefit amount in plain language",
    "frequency": "string — one-time | monthly | quarterly | annual",
    "details": "string — additional benefit details"
  },
  "documents_required": [
    {
      "document_name": "string",
      "is_mandatory": "boolean",
      "where_to_obtain": "string",
      "estimated_time": "string",
      "alternatives": ["array of alternative documents accepted"]
    }
  ],
  "application_process": {
    "online": {
      "portal_url": "string",
      "steps": ["array of step strings"]
    },
    "offline": {
      "office": "string — where to apply offline",
      "steps": ["array of step strings"]
    },
    "via_csc": "boolean — can apply through Common Service Center"
  },
  "helpline": "string — toll-free helpline number",
  "official_url": "string — official scheme website",
  "launched_year": "number",
  "last_updated": "date string"
}
```

---

## 9. Roadmap

| Phase | Features |
|---|---|
| Phase 1 | Web app, conversational profile, 30+ schemes, document upload, Hindi + English |
| Phase 2 | WhatsApp bot integration via Twilio/WhatsApp Business API, same AI engine |
| Phase 3 | Full voice interaction, 10+ Indian languages, IVRS for feature phones |
| Phase 4 | State-specific scheme databases for all 28 states and 8 UTs |


---

## 10. Glossary

| Term | Definition |
|---|---|
| CSC | Common Service Center — government-authorized service delivery points |
| BPL | Below Poverty Line |
| APL | Above Poverty Line |
| AAY | Antyodaya Anna Yojana — poorest of the poor category |
| RAG | Retrieval-Augmented Generation — AI technique combining search with LLM |
| OCR | Optical Character Recognition — extracting text from images |
| STT | Speech-to-Text — converting voice to text |
| TTS | Text-to-Speech — converting text to voice |
| LLM | Large Language Model — AI model for natural language understanding |
| UIDAI | Unique Identification Authority of India — Aadhaar authority |
| MVP | Minimum Viable Product |
| P0 | Must-have priority (required for MVP) |
| P1 | Should-have priority (important but not blocking) |
| P2 | Nice-to-have priority (future enhancement) |

---

This is your complete **`requirements.md`**. 