# `src/` — Application Source Code

This directory contains all runnable application code for the Vitalis platform, organized into five top-level sub-packages:

| Directory | Language / Stack | Purpose |
|---|---|---|
| [`backend/`](#backend) | Python, FastAPI | REST API, AI engine, data pipelines |
| [`frontend/`](#frontend) | HTML, CSS, Vanilla JS | Doctor-facing web dashboard |
| [`android/`](#android) | Kotlin, Jetpack Compose | Patient-facing mobile app |
| [`db/`](#db) | PostgreSQL SQL | Database schema and migrations |
| [`mock-data/`](#mock-data) | Node.js, JSON | Test fixtures and data generators |

---

## `backend/`

The Python backend is structured as an importable package (`backend.*`). Run from `src/` using:

```bash
uvicorn backend.main:app --reload --port 8000
```

### Entry Point

| File | Purpose |
|---|---|
| `main.py` | FastAPI application factory; mounts all routers, configures CORS, health-check endpoint |
| `requirements.txt` | Pinned Python dependencies (FastAPI, Supabase, Gemini, sentence-transformers, FAISS, Tesseract wrappers) |
| `__init__.py` | Package marker |

---

### `backend/config/`

Environment-based configuration helpers.

| File | Purpose |
|---|---|
| `supabase_client.py` | Singleton Supabase client constructed from `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`; exposes the `medical-reports` storage bucket helper |

---

### `backend/routes/`

Thin HTTP layer — maps URLs to controller calls. Each module corresponds to one feature domain.

| File | Routes served | Description |
|---|---|---|
| `rag.py` | `/api/v1/rag/*` | Patient AI chat queries (RAG-grounded) |
| `reports.py` | `/api/v1/reports/*` | Report upload, OCR, Gemini extraction, status polling |
| `vitals.py` | `/api/v1/vitals/*` | Wearable data ingestion and retrieval |
| `alerts.py` | `/api/v1/alerts/*` | Clinical alert listing and management |
| `summaries.py` | `/api/v1/summaries/*` | AI-generated weekly health summaries |
| `doctor.py` | `/api/v1/doctor/*` | Doctor portal: patient roster, detail view |
| `users.py` | `/api/v1/users/*` | User profile creation and lookup |
| `auth.py` | `/api/v1/auth/*` | Authentication endpoints |
| `voice.py` | `/api/v1/voice/*` | Voice-optimized AI query endpoint |
| `environment.py` | `/api/v1/environment/*` | Live AQI/weather data retrieval |
| `upload.py` | `/api/v1/upload/*` | Low-level storage upload |
| `debug.py` | `/api/v1/debug/*` | Developer diagnostics (non-production) |
| `report_status_ws.py` | `/api/v1/ws/report-status` | WebSocket endpoint for real-time processing status |

---

### `backend/controllers/`

Use-case orchestration — validates inputs, coordinates services, writes to the database. No FastAPI-specific types leak into this layer.

| File | Purpose |
|---|---|
| `reports_controller.py` | Orchestrates the full report ingestion pipeline: upload → OCR → Gemini extraction → lab normalization → embedding → indexing |
| `doctor_controller.py` | Aggregates patient data (labs, vitals, alerts, summaries) for the doctor dashboard |
| `users_controller.py` | User creation, profile lookup, and demographic management |

---

### `backend/services/`

Reusable business logic with no FastAPI coupling. Each sub-package is independently testable.

#### `services/preprocessing/`
OCR post-processing and chunking.

| File | Purpose |
|---|---|
| `text_cleaning.py` | Regex-based OCR noise removal (strips addresses, artifacts, non-medical content) |
| `gemini_cleaning.py` | LLM-assisted OCR cleaning using Gemini 2.0 Flash; gracefully falls back to regex if the API call fails |
| `chunking.py` | Sentence-aware text chunking (`chunk_size=300`, `chunk_overlap=50`) using `langchain-text-splitters`; produces metadata-rich chunks ready for embedding |

#### `services/embeddings/`
Embedding abstraction layer.

| File | Purpose |
|---|---|
| `interfaces.py` | `Embedder` protocol — dependency-inversion interface for all embedders |
| `sentence_transformer_embedder.py` | `BAAI/bge-base-en-v1.5` implementation; LRU-cached model loading (maxsize=4) to avoid reloading 500 MB from disk |
| `query_embedding.py` | Convenience helpers: `get_default_embedder()`, `embed_query()`, `embed_texts()` |

#### `services/retrieval/`
The RAG retrieval engine — the primary vector store with a FAISS fallback.

| File | Purpose |
|---|---|
| `__init__.py` | Public API and automatic pgvector → FAISS fallback routing |
| `pgvector_retrieval.py` | Supabase pgvector retrieval via `match_report_chunks` RPC; user-scoped, threshold-filtered cosine similarity search |
| `faiss_retrieval.py` | In-memory FAISS `IndexFlatIP` index; activates automatically if pgvector is unavailable, preserving full RAG functionality |
| `indexer.py` | Chunk indexing orchestration: deduplication, stale-chunk detection by `EMBEDDING_VERSION`, re-indexing logic |
| `mock_retrieval.py` | Deterministic stub for UI development and unit tests |

#### `services/context/`
Assembles the full LLM context window from all data sources.

| File | Purpose |
|---|---|
| `context_builder.py` | Combines: RAG chunks (max 10, 4,000 chars), structured lab trends, wearable pivot arrays, AQI/weather data, alert summaries, and user demographics into a single prompt context object |
| `data_fetchers.py` | Async fetchers for each data source (Supabase queries, environment API calls) |

#### `services/llm/`
Gemini integration layer.

| File | Purpose |
|---|---|
| `interfaces.py` | `LLMService` protocol |
| `gemini_service.py` | Gemini 3.1 Pro client; single-turn and multi-turn chat, `temperature=0.1`, citation enforcement |
| `prompt_builder.py` | Constructs role-specific system prompts by injecting the context object; separate prompt paths for patient vs doctor vs summarizer |

#### `services/summaries/`
Weekly automated health summary generation.

| File | Purpose |
|---|---|
| `generator.py` | Async summary generation pipeline; produces role-specific briefs (empathetic patient goals vs dense clinical overviews for doctors); orchestrated by `pg_cron` weekly |

#### `services/wearable/`
Wearable data alignment and pivot pipeline.

| File | Purpose |
|---|---|
| `interfaces.py` | Wearable data protocols |
| `models.py` | Pydantic models for raw wearable readings and aggregated daily records |
| `service.py` | Core pivot logic: aligns high-frequency readings into strict, gap-filled calendar arrays; resolves LLM temporal blindness |
| `store.py` | Supabase read/write for `wearable_vitals` table |

#### `services/environment/`
Live environmental data integration.

| File | Purpose |
|---|---|
| `fetchers.py` | Calls the Open-Meteo API for real-time AQI, PM2.5, temperature, and humidity by patient coordinates |
| `interfaces.py` | Environment data protocols |
| `models.py` | Pydantic models for AQI readings and weather snapshots |
| `service.py` | Caching, error handling, and context-ready formatting of environmental data |
| `store.py` | Persistence of environmental snapshots to Supabase `environmental_data` table |

---

### `backend/extraction/`
Gemini-powered structured lab data extraction from OCR text.

| File | Purpose |
|---|---|
| `gemini_extractor.py` | Sends cleaned OCR text to Gemini with a structured extraction prompt; parses JSON lab result objects |
| `inserter.py` | Writes extracted lab results to `lab_results` table with full provenance metadata |
| `normalizer.py` | Normalizes raw extracted test names to canonical identifiers (e.g., "Hb" → "hemoglobin") |
| `models.py` | Pydantic models for extracted lab data |
| `pipeline.py` | End-to-end extraction pipeline orchestrator |

---

### `backend/labs/`
Lab result normalization and canonical mapping.

| File | Purpose |
|---|---|
| `normalization.py` | Maps 200+ raw lab test name variants to canonical names using a fuzzy-match dictionary; enables reliable longitudinal tracking across different lab report formats |

---

### `backend/rules/`
Deterministic clinical alert rules engine.

| File | Purpose |
|---|---|
| `definitions.py` | 50+ clinical alert rule definitions (abnormal lab thresholds, vitals alerts, trend-based triggers) |
| `engine.py` | Evaluates all rules against a patient's current data; generates structured alert records with full evidence linkage |
| `inserter.py` | Writes generated alerts and their evidence to `alerts` + `alert_evidence` tables |
| `environment.py` | Environmental alert rules (e.g., hazardous AQI thresholds) |
| `config.json` | Configurable threshold overrides for specific alert rules |
| `lab_test_dictionary.json` | Canonical lab test reference ranges and severity thresholds |

---

### `backend/ocr/`
Tesseract OCR pipeline for PDF ingestion.

| File | Purpose |
|---|---|
| `ocr_engine.py` | Core Tesseract invocation via `pytesseract`; converts PDF pages to images with `pdf2image` |
| `pipeline.py` | OCR pipeline orchestrator: PDF → image → text → cleaned text |
| `preprocessor.py` | OpenCV image preprocessing (deskew, denoise, binarize) before OCR |
| `extractors.py` | Post-OCR structural extraction helpers |
| `normalizers.py` | OCR text normalization utilities |
| `inserters.py` | Writes raw OCR text to `medical_reports.ocr_text` (immutable, single source of truth) |

---

### `backend/prompts/`
Role-specific LLM system prompts (plain text, version-controlled).

| File | Audience | Purpose |
|---|---|---|
| `system_user.txt` | Patient | Empathetic health coaching; cites only provided evidence; safe boundaries |
| `system_doctor.txt` | Clinician | Dense clinical overview; lab trend interpretation; formal tone |
| `system_summarizer_user.txt` | Patient (weekly) | Weekly goal generation prompt |
| `system_summarizer_doctor.txt` | Doctor (weekly) | Clinical brief generation prompt |
| `citation_user.txt` | Patient | Citation format instructions for patient responses |
| `citation_doctor.txt` | Doctor | Citation format instructions for doctor responses |
| `citation_summarizer.txt` | Summaries | Citation instructions for summary generation |
| `data_extraction.txt` | System | Structured lab extraction prompt |

---

### `backend/middleware/`

| File | Purpose |
|---|---|
| `auth_middleware.py` | JWT validation middleware using Supabase Auth; injects verified `user_id` into request state |

---

### `backend/models/`

| File | Purpose |
|---|---|
| `user.py` | Pydantic models for user profiles and demographics |

---

### `backend/contracts/`
API and context contract artifacts — schema definitions that govern how data flows between the retrieval engine and the LLM layer.

---

### `backend/scripts/`
Developer utilities and operational cron scripts. Not imported by production code.

| File | Purpose |
|---|---|
| `cron_weekly_summarizer.py` | Batch summary generation sweep (run by `pg_cron` weekly) |
| `cron_nightly_alerts.py` | Nightly alert evaluation sweep across all patients (max concurrency: 10) |
| `seed_users.py` | Seeds Supabase with demo patient and doctor personas |
| `demo_personas.py` | Generates realistic patient demo data |
| `ingest_supabase_reports.py` | Batch-ingests PDF reports from a local directory into Supabase |
| `eval_retrieval.py` | Retrieval quality evaluation: runs benchmark queries, reports precision/recall |
| `migrate_lab_results_normalization.py` | One-time migration to apply canonical lab name normalization to existing records |
| `remap_unmapped_tests.py` | Identifies and re-maps lab results that failed initial normalization |
| `create_test_user.py` | Creates a fresh test user for development |
| `seed_users.py` | Comprehensive user seeding with wearable and report data |
| `impersonate.py` | Developer tool to generate impersonation tokens for testing |
| `mock_server.py` | Standalone mock backend for frontend development without a live Supabase instance |
| `test_voice.py` | Smoke test for the voice query endpoint |

---

## `frontend/`

Static doctor portal — no build step required, served directly from the filesystem or any static host.

| File | Purpose |
|---|---|
| `doctor-login.html` | Clinician authentication screen |
| `doctor-dashboard.html` | Patient roster: list of assigned patients with risk indicators |
| `doctor-patient.html` | Full patient detail: lab trends, wearable charts, AI summaries, alert history |
| `doctor-admin.html` | Admin panel for doctor account provisioning |

### `frontend/js/`

| File | Purpose |
|---|---|
| `api.js` | Shared API client (Fetch wrapper), report helpers, WebSocket status listener |
| `doctor-api.js` | Doctor-specific API client for `/api/v1/doctor/*` endpoints |
| `components.js` | Reusable UI render helpers (charts, alert badges, lab tables) |
| `demo-data.js` | Offline demo data fallbacks for UI development |

---

## `android/`

Native Android application — patient-facing voice-enabled AI health coach.

**Architecture:** `UI (Compose) → ViewModel → Repository → API Adapter → Retrofit → Backend`

### `app/src/main/java/com/vitalis/health/`

#### `data/model/`
Kotlinx serialization data models:

| File | Models |
|---|---|
| `Dashboard.kt` | `DashboardData`, `DashboardResponse`, `Environment` |
| `Alert.kt` | `Alert`, `AlertEvidence`, `AlertsResponse` |
| `RagQuery.kt` | `RagQueryRequest`, `RagData`, `RagResponse`, `Citation` |
| `Report.kt` | `ReportUploadResponse` |
| `Doctor.kt` | `Patient`, `PatientsResponse` |

#### `data/network/`
| File | Purpose |
|---|---|
| `HealthApiService.kt` | Retrofit interface — raw HTTP contract for all backend endpoints |
| `ApiResult.kt` | Sealed class `Success / Error` for type-safe error handling |

#### `data/adapter/`
| File | Purpose |
|---|---|
| `HealthApiAdapter.kt` | Interface defining all repository-facing operations |
| `HealthApiAdapterImpl.kt` | Implementation: error mapping, response transformation, retry logic |

#### `data/repository/`
| File | Purpose |
|---|---|
| `HealthRepository.kt` | Business logic bridge between ViewModels and the API adapter |

#### `di/`
| File | Purpose |
|---|---|
| `NetworkModule.kt` | Wires OkHttp, Retrofit, JSON deserializer, and adapter factory |

#### `ui/`
| File | Purpose |
|---|---|
| `DashboardViewModel.kt` | Dashboard screen state management |
| `AlertsViewModel.kt` | Alerts screen state management |
| `AssistantViewModel.kt` | AI voice chat state: history, STT input, TTS output |
| `ViewModelFactory.kt` | Manual dependency injection factory |

#### `VitalisApp.kt`
Application singleton — dependency graph initialization.

---

## `db/`

PostgreSQL schema and ordered migrations.

| File / Directory | Purpose |
|---|---|
| `schema.sql` | Base table definitions for `medical_reports`, `lab_results`, `alerts`, `alert_evidence`, `report_chunks` |
| `schema.md` | Schema contract document: data invariants, immutability guarantees, RLS requirements |
| `migrations/` | 24 sequential migration files — apply in order `000` → `023` |

### Migration Index

| File | Change |
|---|---|
| `000_create_users_table.sql` | Users table with Supabase Auth linkage |
| `001_add_report_chunks.sql` | `report_chunks` table + pgvector column |
| `002–003` | Chunk metadata and section filters |
| `004_add_processing_status.sql` | Async ingestion status tracking |
| `005_add_section_filter_to_rpc.sql` | Scoped vector search RPC |
| `006_add_environmental_data.sql` | `environmental_data` table |
| `007_add_env_evidence_to_alert_evidence.sql` | Environmental evidence in alerts |
| `008_add_wearable_vitals.sql` | `wearable_vitals` table and indexes |
| `009_auth_and_reports.sql` | Auth and report ownership constraints |
| `010_vitals_cleanup_job.sql` | `pg_cron` job for old vitals pruning |
| `011_add_health_summaries.sql` | `health_summaries` table |
| `012–013` | Lab text values, user age column |
| `014–015` | Age column cleanup, full RLS privacy hardening |
| `016_lab_test_normalization.sql` | Canonical test name column |
| `017_ensure_env_evidence_column.sql` | Schema safety migration |
| `018_add_get_trended_labs_rpc.sql` | Window-function RPC for longitudinal lab trends |
| `019_add_get_daily_wearable_aggregates_rpc.sql` | Daily aggregation RPC for wearable pivot |
| `020–023` | Timezone fixes, HR type corrections, max-per-day aggregation |

---

## `mock-data/`

Test data generation utilities and static JSON fixtures.

| File | Purpose |
|---|---|
| `generate_test_pdfs.js` | Node.js script to synthesize sample medical report PDFs |
| `generate_wearable_data.js` | Generates realistic wearable time-series payloads |
| `wearable_payload.json` | ~2.5 MB sample wearable dataset (heart rate, SpO₂, steps, sleep) |
| `mock_doctor_roster.json` | Sample doctor patient roster response |
| `mock_patient_detail.json` | Full patient detail API mock response |
| `mock_report_extractions.json` | Sample Gemini extraction output for 3 report types |
| `DELIVERY_MANIFEST.md` | Inventory of all deliverable artifacts |
| `README.md` | Mock data usage guide |

---

## `sample_reports/`

A curated set of anonymized PDF medical reports used for end-to-end pipeline testing, covering blood panels, lipid profiles, thyroid function, and HbA1c tests.

---

## `types/`

Shared JSON Schema / TypeScript type definitions used across the frontend and mock-data scripts to ensure consistent API contract adherence.
