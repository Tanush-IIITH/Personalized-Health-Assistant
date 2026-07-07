# Personalized AI Health Assistant

> A dual-sided healthcare platform bridging static medical reports and continuous wearable vitals, built in collaboration with **SuryaQuantum AI** for the *Design and Analysis of Software Systems* course at IIIT Hyderabad.

[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?style=flat-square&logo=fastapi)](src/backend/)
[![Mobile](https://img.shields.io/badge/Mobile-Kotlin%20%7C%20Jetpack%20Compose-7C4DFF?style=flat-square&logo=android)](src/android/)
[![Frontend](https://img.shields.io/badge/Frontend-Vanilla%20JS%20%7C%20HTML-F7DF1E?style=flat-square&logo=javascript)](src/frontend/)
[![Database](https://img.shields.io/badge/Database-Supabase%20%7C%20pgvector-3ECF8E?style=flat-square&logo=supabase)](src/db/)
[![LLM](https://img.shields.io/badge/LLM-Gemini%203.1%20Pro-4285F4?style=flat-square&logo=google)](src/backend/services/llm/)

---

## Overview

A **dual-sided** healthcare platform with:

- A **patient-facing Android app** — a voice-enabled AI health coach that answers questions grounded in the patient's own lab reports and live wearable data.
- A **doctor-facing web dashboard** — a remote monitoring and risk management portal for clinicians to track patient biomarkers, alerts, and AI-generated clinical summaries.

The system unifies three historically siloed data sources — PDF medical reports, high-frequency wearable vitals, and live environmental data — into a single, context-aware AI reasoning layer.

---

## Key Architectural Highlights

### Advanced RAG Pipeline with FAISS Fallback
The retrieval engine uses **Supabase pgvector** as the primary vector store for semantic search over embedded medical report chunks. A fully operational, in-memory **FAISS fallback** architecture activates automatically if the pgvector extension is unavailable, ensuring the RAG pipeline is highly available with zero manual intervention. Chunks are embedded using `BAAI/bge-base-en-v1.5` (top MTEB-ranked, CPU-deployable) with 768-dimensional normalized vectors, enabling cosine similarity via inner product.

### Longitudinal Lab Tracking via SQL Window Functions
Custom **PostgreSQL Window Functions** (`ROW_NUMBER`, `LAG`, ranked partitions) isolate and track the historical trajectory of individual biomarkers across multiple hospital visits. Rather than querying raw unstructured text, the AI layer receives structured trend arrays — enabling mathematical correlation of, e.g., a rising HbA1c trend over three quarters — grounded entirely in verifiable lab data.

### Automated Summary Generation with `pg_cron`
An asynchronous, concurrent pipeline orchestrated by **`pg_cron`** runs weekly LLM generation sweeps. The system generates two role-specific outputs simultaneously: empathetic weekly goal summaries for patients, and dense clinical overviews for doctors. Each summary is produced with Gemini 3.1 Pro at temperature 0.1 to guarantee near-deterministic, factually grounded output.

### Wearable Data Pivot Pipeline
Solved *LLM temporal blindness* by building a Python-driven **calendar pivot system** that aligns high-frequency wearable readings (heart rate, SpO₂, steps, sleep stages) into strict, gap-filled daily arrays. This allows Gemini to accurately correlate day-to-day metric drops with health events logged in medical reports — bridging the gap between continuous sensor streams and episodic clinical data.

### Environmental Context Integration
Live **Open-Meteo AQI and weather data** is fetched per patient location and injected into every RAG context window. This enables location-aware health coaching — for example, the AI can modify respiratory alerts or outdoor activity advice in real time based on hazardous local air quality readings.

### Privacy & Security Hardening
Row-Level Security (RLS) policies enforced at the database layer (`015_privacy_hardening.sql`) ensure strict user-data isolation. All alert evidence is stored as verifiable, traceable database records — LLM-generated or dynamically inferred evidence is explicitly forbidden by the schema contract.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                 │
│   ┌──────────────────────┐    ┌──────────────────────────────────┐  │
│   │  Android App (Kotlin) │    │  Doctor Dashboard (Vanilla JS)   │  │
│   │  Jetpack Compose UI   │    │  doctor-dashboard.html           │  │
│   │  Voice STT/TTS        │    │  doctor-patient.html             │  │
│   └──────────┬───────────┘    └───────────────┬──────────────────┘  │
└──────────────┼────────────────────────────────┼────────────────────┘
               │  HTTPS / WebSocket             │  HTTPS
┌──────────────▼────────────────────────────────▼────────────────────┐
│                    FASTAPI BACKEND (src/backend/)                   │
│                                                                     │
│  Routes → Controllers → Services                                    │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌───────────┐  ┌───────────────┐  │
│  │ RAG Engine │  │ Rules/     │  │ Summaries │  │ Wearable      │  │
│  │ pgvector + │  │ Alerts     │  │ Generator │  │ Pivot Service │  │
│  │ FAISS      │  │ Engine     │  │ (pg_cron) │  │               │  │
│  └─────┬──────┘  └─────┬──────┘  └─────┬─────┘  └──────┬────────┘  │
│        │               │               │                │           │
│  ┌─────▼───────────────▼───────────────▼────────────────▼────────┐  │
│  │              Context Builder                                   │  │
│  │  RAG chunks + Lab trends + Wearables + AQI/Weather + Alerts   │  │
│  └────────────────────────────┬───────────────────────────────────┘  │
│                               │                                     │
│  ┌────────────────────────────▼───────────────────────────────────┐  │
│  │              Gemini 3.1 Pro (temperature = 0.1)                │  │
│  └────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                  SUPABASE (PostgreSQL + pgvector)                    │
│  medical_reports │ lab_results │ report_chunks │ wearable_vitals     │
│  alerts │ alert_evidence │ health_summaries │ environmental_data     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
Personalized-Health-Assistant/
├── README.md                      ← You are here
├── .env.example                   ← Environment variable template
├── .gitignore
├── .gitattributes
│
├── src/                           ← All application source code
│   ├── README.md                  ← Source layer overview
│   │
│   ├── backend/                   ← Python FastAPI backend
│   │   ├── main.py                ← App entrypoint, router mounts
│   │   ├── requirements.txt       ← Python dependencies
│   │   ├── config/                ← Supabase client, env config
│   │   ├── routes/                ← HTTP route handlers (FastAPI APIRouter)
│   │   ├── controllers/           ← Use-case orchestration logic
│   │   ├── services/              ← Core business logic modules
│   │   │   ├── preprocessing/     ← OCR cleaning, text chunking
│   │   │   ├── embeddings/        ← Sentence embedding interfaces & impl
│   │   │   ├── retrieval/         ← pgvector + FAISS retrieval engine
│   │   │   ├── context/           ← Context builder (RAG assembly)
│   │   │   ├── llm/               ← Gemini service, prompt builder
│   │   │   ├── summaries/         ← Weekly summary generation
│   │   │   ├── wearable/          ← Wearable data pivot pipeline
│   │   │   └── environment/       ← Open-Meteo AQI/weather integration
│   │   ├── extraction/            ← Gemini-powered lab data extraction
│   │   ├── labs/                  ← Lab result normalization engine
│   │   ├── rules/                 ← Deterministic clinical alert rules
│   │   ├── ocr/                   ← Tesseract OCR pipeline
│   │   ├── prompts/               ← LLM system prompts (role-specific)
│   │   ├── middleware/            ← Auth middleware (JWT/Supabase)
│   │   ├── models/                ← Pydantic data models
│   │   ├── contracts/             ← API and context schema contracts
│   │   └── scripts/               ← Dev utilities, cron runners, seeders
│   │
│   ├── frontend/                  ← Doctor-facing web dashboard
│   │   ├── doctor-login.html      ← Clinician sign-in
│   │   ├── doctor-dashboard.html  ← Patient roster view
│   │   ├── doctor-patient.html    ← Individual patient detail
│   │   ├── doctor-admin.html      ← Doctor provisioning panel
│   │   └── js/                    ← API clients, render helpers
│   │
│   ├── android/                   ← Patient-facing Android app
│   │   ├── ARCHITECTURE.md        ← Clean-architecture reference map
│   │   └── app/src/main/java/com/vitalis/health/
│   │       ├── data/              ← Models, network, adapters, repository
│   │       ├── ui/                ← ViewModels, Compose screens
│   │       └── di/                ← Dependency injection / NetworkModule
│   │
│   ├── db/                        ← Database schema and migrations
│   │   ├── schema.sql             ← Base table definitions
│   │   ├── schema.md              ← Schema contract documentation
│   │   └── migrations/            ← 24 sequential migration files
│   │
│   ├── mock-data/                 ← Test data generators and JSON fixtures
│   │   ├── generate_test_pdfs.js
│   │   ├── generate_wearable_data.js
│   │   ├── wearable_payload.json
│   │   ├── mock_doctor_roster.json
│   │   └── mock_patient_detail.json
│   │
│   ├── sample_reports/            ← Sample PDF medical reports for testing
│   └── types/                     ← Shared TypeScript/JSON type definitions
│
├── docs/                          ← Project documentation and artifacts
│   ├── README.md                  ← Documentation index
│   ├── ProjectPlan.md             ← Sprint plan and milestone tracker
│   ├── hyperparameter_documentation.md ← All AI tuning decisions
│   ├── admin-setup.md             ← Repository setup guide (TA)
│   ├── release-labels.txt         ← Weekly release category labels
│   ├── StatusTracker.xls          ← Live development effort tracker
│   ├── TestPlan_Team48.xls        ← Test plan spreadsheet
│   ├── 48_SRS.pdf                 ← Software Requirements Specification
│   ├── Design.doc                 ← System design document
│   ├── Requirements.doc           ← Requirements specification
│   ├── ProjectSynopsis.doc        ← Project synopsis
│   ├── MOMs/                      ← Minutes of meetings (4 sessions)
│   ├── slides/                    ← Presentation LaTeX sources
│   ├── team_specs/                ← Individual contribution specs
│   │   ├── Tanush.md              ← AI engine, RAG, data pipelines
│   │   ├── Aditya.md
│   │   ├── Avnish.md
│   │   └── Rishabh.md
│   └── Release 1/                 ← Release 1 deliverables
│
└── tests/                         ← Test suite
    ├── README.md                  ← Testing documentation
    ├── security                   ← Security audit notes
    └── testcases/                 ← Structured test case documents
        ├── README.md
        ├── test-cases.md
        ├── test-cases.csv
        ├── comprehensive-test-cases.md
        └── comprehensive-test-cases.csv
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **AI / LLM** | Google Gemini 3.1 Pro (chat), Gemini 2.0 Flash (preprocessing) |
| **Embeddings** | `BAAI/bge-base-en-v1.5` via `sentence-transformers` |
| **Vector Search** | Supabase pgvector (primary), FAISS-CPU (fallback) |
| **Database** | Supabase (PostgreSQL), `pg_cron` for scheduled jobs |
| **OCR** | Tesseract via `pytesseract`, OpenCV, pdf2image |
| **Mobile App** | Kotlin, Jetpack Compose, Retrofit, OkHttp, Android STT/TTS |
| **Doctor Dashboard** | Vanilla HTML/CSS/JavaScript, Fetch API, WebSocket |
| **Environment API** | Open-Meteo (AQI + weather, zero API key required) |
| **Auth** | Supabase Auth (JWT), Row-Level Security (RLS) |

---

## Getting Started

### Prerequisites
- Python 3.11+
- A [Supabase](https://supabase.com) project with the `vector` extension enabled
- A Google AI API key (Gemini)
- Tesseract OCR + Poppler installed on the host OS
- Android Studio (for the mobile app)

### Backend Setup

```bash
# 1. Clone and enter the project
git clone <repo-url>
cd Personalized-Health-Assistant

# 2. Install Python dependencies
cd src/backend
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example .env
# Edit .env — set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

# 4. Apply database migrations (from the project root)
# Run src/db/schema.sql first, then apply migrations in order:
# src/db/migrations/000_create_users_table.sql → 023_fix_daily_aggregation_max_per_day.sql

# 5. Start the backend server (run from src/)
cd src
uvicorn backend.main:app --reload --port 8000
```

### Doctor Dashboard
Open `src/frontend/doctor-login.html` directly in a browser. No build step required.

### Android App
1. Open `src/android/` in **Android Studio**.
2. Let Gradle sync (requires JDK 17+).
3. Update `BASE_URL` in `HealthApiService.kt` to point to your backend.
4. Run on an emulator or physical device.

---

## Core API Endpoints

### Report Ingestion
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/reports/ingest` | Upload PDF → OCR → Gemini extraction (async, returns 202) |
| `GET` | `/api/v1/reports/status/{report_id}` | Poll: `pending → ocr_complete → done / failed` |
| `POST` | `/api/v1/reports/process` | Blocking ingest (for scripts/tests) |

### AI / RAG
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/rag/query` | Patient-facing AI chat (RAG + wearables + env context) |
| `POST` | `/api/v1/voice/query` | Voice-optimized AI query endpoint |

### Doctor Portal
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/doctor/patients` | List patients assigned to a doctor |
| `GET` | `/api/v1/doctor/patient/{id}` | Full patient detail (labs, vitals, alerts, summaries) |
| `GET` | `/api/v1/summaries/{user_id}` | Retrieve latest AI-generated health summaries |

### Vitals & Alerts
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/vitals` | Ingest wearable readings batch |
| `GET` | `/api/v1/alerts/{user_id}` | Retrieve active clinical alerts |

---

## Database Migrations

The `src/db/migrations/` directory contains 24 sequential SQL migrations representing the full evolution of the schema:

| Range | Area |
|---|---|
| `000 – 004` | Core tables: users, reports, lab results, processing status |
| `005 – 007` | RAG enhancements: section filtering, environmental evidence |
| `008 – 010` | Wearable vitals schema, cleanup cron jobs |
| `011 – 013` | Health summaries, lab text values, user demographics |
| `014 – 015` | Privacy hardening, RLS policies |
| `016 – 017` | Lab test normalization, environmental evidence column |
| `018 – 023` | Analytics RPCs: trended labs, daily wearable aggregates, timezone fixes |

---

## AI Hyperparameter Reference

All AI hyperparameters are documented with full rationale in [`docs/hyperparameter_documentation.md`](docs/hyperparameter_documentation.md). Key values:

| Parameter | Value | Rationale |
|---|---|---|
| Embedding model | `BAAI/bge-base-en-v1.5` | #1 MTEB-ranked, CPU-deployable, 768-dim |
| LLM model | `gemini-3.1-pro-preview` | Highest reasoning quality for medical context |
| LLM temperature | `0.1` | Near-deterministic; prevents medical hallucinations |
| Chunk size | `300 chars` | Captures 3–5 related lab results per chunk |
| Chunk overlap | `50 chars` | ~17% overlap preserves sentence boundaries |
| Retrieval top-k | `10` | Fills context budget without excess compute |
| Match threshold | `0.4` | Recall-precision sweet spot for medical queries |

---

## Team

Built by **Team 48** for the Design and Analysis of Software Systems (DASS) course, IIIT Hyderabad, Spring 2026, in collaboration with **SuryaQuantum AI**.

| Contributor | Primary Area |
|---|---|
| **Tanush** | AI retrieval engine, RAG pipeline, data integration, automated intelligence layers |
| **Aditya** | Android mobile application |
| **Avnish** | Doctor dashboard frontend |
| **Rishabh** | Backend infrastructure, auth |

---
