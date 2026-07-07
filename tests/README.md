# `tests/` — Test Suite

This directory contains all test artifacts for the Vitalis platform, including structured functional test cases, security audit notes, and backend unit tests.

---

## Directory Structure

```
tests/
├── README.md              ← This file
├── security               ← Security audit and penetration testing notes
└── testcases/             ← Structured functional test case documents
    ├── README.md          ← Test case format guide
    ├── test-cases.md      ← Core functional test cases (Markdown)
    ├── test-cases.csv     ← Core test cases (CSV, for spreadsheet import)
    ├── comprehensive-test-cases.md  ← Full expanded test suite (Markdown)
    └── comprehensive-test-cases.csv ← Full test suite (CSV)
```

> **Backend unit tests** live alongside the source code at `src/backend/tests/` and are run with `pytest` from the `src/` directory.

---

## `testcases/`

Structured test cases covering all major functional areas of the platform. Each test case follows a consistent schema:

| Field | Description |
|---|---|
| **No. / ID** | Unique test case identifier (e.g., `TC-01`) |
| **Use Case** | The feature or user flow under test |
| **Pre-conditions** | Required system state before execution |
| **Test Description** | Step-by-step execution instructions |
| **Expected Outcome** | The observable correct result |
| **R1 Outcome** | Result from Round 1 testing |
| **R2 Outcome** | Result from Round 2 regression testing |
| **Comments** | Notes on failures, workarounds, or known issues |

### Test Domains Covered

| Domain | Example Test Cases |
|---|---|
| **API Health** | Health check endpoint returns `{"status": "ok"}` |
| **Report Ingestion** | Upload valid PDF, poll to `done`; reject empty file (400); reject missing `user_id` (422) |
| **OCR Pipeline** | Tesseract extracts text from scanned PDF; Gemini cleaning improves noisy output |
| **Lab Extraction** | Gemini correctly extracts HbA1c, creatinine, lipid values with units and reference ranges |
| **RAG Querying** | Patient query returns grounded response with citations; no response cites data outside user's records |
| **FAISS Fallback** | System returns valid RAG responses when pgvector extension is disabled |
| **Wearable Ingestion** | Batch vitals payload accepted; gap-filled calendar array correctly generated |
| **Alert Rules Engine** | Abnormal HbA1c triggers `high` severity alert with lab result evidence linked |
| **Weekly Summaries** | Summary generated for patient with ≥1 report; doctor summary uses clinical tone |
| **Doctor Dashboard** | Patient roster loads; patient detail shows lab trends, wearables, and alerts |
| **Android App** | STT input reaches RAG endpoint; TTS plays AI response; dashboard renders vitals |
| **Auth & Privacy** | Patient cannot query another patient's data; RLS rejects cross-user requests |
| **Environment API** | AQI data injected into RAG context; high AQI modifies respiratory coaching output |
| **WebSocket Status** | Processing status transitions from `pending` → `ocr_complete` → `done` in real time |

### Files

#### `test-cases.md` / `test-cases.csv`
The core test suite (~50 cases) covering all primary happy-path and error-path scenarios. Used for Release 1 and Release 2 formal testing rounds.

#### `comprehensive-test-cases.md` / `comprehensive-test-cases.csv`
The expanded test suite (~200+ cases) including:
- Edge cases (empty reports, unsupported PDF structures, OCR-resistant scans)
- Concurrency scenarios (multiple simultaneous uploads)
- Regression cases for all bug fixes applied between R1 and R2
- Security and authorization boundary tests

---

## `security`

Security audit notes documenting:

- **Authentication boundary tests**: JWT expiry, token replay, user impersonation attempts.
- **Authorization tests**: RLS policy verification for cross-user data access at the database and API layers.
- **Input validation**: Malformed PDF uploads, oversized payloads, SQL injection attempts on filter parameters.
- **LLM safety**: Prompt injection attempts against the RAG query endpoint; hallucination boundary checks.
- **Data leakage**: Verified no PII appears in error messages, logs, or alert evidence JSON blobs.

---

## `src/backend/tests/` — Unit Tests

Backend unit and integration tests (not in this directory — see `src/backend/tests/`).

**Run from `src/`:**

```bash
# Run all backend tests
pytest backend/tests/ -v

# Run with asyncio support
pytest backend/tests/ -v --asyncio-mode=auto
```

### Test Coverage Areas

| Module | Test Focus |
|---|---|
| `services/retrieval/` | pgvector query construction, FAISS index build and search, fallback activation |
| `services/preprocessing/` | Chunking boundary conditions, OCR cleaning regex correctness |
| `services/embeddings/` | Embedder interface compliance, model caching behavior |
| `services/context/` | Context builder field assembly, character budget enforcement |
| `services/wearable/` | Pivot array gap-filling, daily aggregation correctness |
| `services/rules/` | Alert rule triggering, severity assignment, evidence linkage |
| `extraction/` | Gemini response parsing, lab result normalization |
| `routes/` | FastAPI endpoint request/response validation |

### Android Unit Tests

Located at `src/android/app/src/test/`:

| File | Purpose |
|---|---|
| `HealthApiAdapterImplTest.kt` | Tests the API adapter error mapping, `Success`/`Error` sealed class branching, and Retrofit response transformation |

**Run from `src/android/`:**
```bash
./gradlew test
```

---

## Running the Full Test Suite

### Backend

```bash
# From the project root
cd src
pip install -r backend/requirements.txt
pytest backend/tests/ -v --asyncio-mode=auto
```

### Android

```bash
cd src/android
./gradlew test           # Unit tests
./gradlew connectedTest  # Instrumented tests (requires emulator/device)
```

### Manual / Functional Tests

Use the structured test cases in `tests/testcases/` with a running backend instance:

```bash
# Start the backend
cd src
uvicorn backend.main:app --reload --port 8000

# Execute test cases manually or via a REST client (e.g., curl, Postman, HTTPie)
# Reference: tests/testcases/comprehensive-test-cases.md
```
