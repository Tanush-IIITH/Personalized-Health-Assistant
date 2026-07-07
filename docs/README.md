# `docs/` — Project Documentation

This directory contains all project management, design, and process documentation produced throughout the DASS Spring 2026 course.

---

## Directory Structure

```
docs/
├── README.md                          ← This file
│
├── ── Core Project Documents ──
├── ProjectPlan.md                     ← Sprint plan, milestones, and weekly goals
├── ProjectSynopsis.doc                ← One-page project synopsis
├── Requirements.doc                   ← Functional and non-functional requirements
├── Design.doc                         ← System design document (architecture, diagrams)
├── 48_SRS.pdf                         ← Software Requirements Specification (formal)
│
├── ── Tracking & Planning ──
├── StatusTracker.xls                  ← Live weekly effort and activity tracker
├── TestPlan_Team48.xls                ← Test plan with test case schedule
├── release-labels.txt                 ← Weekly release category labels (for TA review)
├── admin-setup.md                     ← Repository setup guide (TA / admin use)
│
├── ── Technical Reference ──
├── hyperparameter_documentation.md    ← All AI/ML tuning decisions with rationale
│
├── ── Meetings & Communication ──
├── MOMs/                              ← Minutes of meeting PDFs
│   ├── mom_19_jan.pdf                 ← Meeting 1 (January 19)
│   ├── MOM_16th_Feb.pdf               ← Meeting 2 (February 16)
│   ├── MOM_21_March.pdf               ← Meeting 3 (March 21)
│   └── MOM_17Apr.pdf                  ← Meeting 4 (April 17)
│
├── ── Individual Specifications ──
├── team_specs/                        ← Per-contributor technical specs
│   ├── Tanush.md                      ← AI engine, RAG pipeline, data integrations
│   ├── Aditya.md                      ← Android application
│   ├── Avnish.md                      ← Doctor dashboard frontend
│   └── Rishabh.md                     ← Backend infrastructure and auth
│
├── ── Presentations ──
├── slides/
│   └── slides_ocr_extraction.tex      ← LaTeX source for OCR extraction presentation
│
└── Release 1/                         ← Release 1 deliverable snapshot
```

---

## Document Descriptions

### `ProjectPlan.md`
Sprint-by-sprint breakdown of planned activities, team assignments, and milestones. Updated weekly to reflect actual vs. estimated progress. Used as the primary planning artifact for TA review.

---

### `48_SRS.pdf` — Software Requirements Specification
The formal SRS document covering:
- **Functional Requirements**: report ingestion, RAG querying, wearable data ingestion, alert generation, summary production, doctor portal features.
- **Non-Functional Requirements**: response latency targets, data privacy (HIPAA-aligned design), system availability, and graceful degradation.
- **Use Case Diagrams**: patient flow, doctor flow, and admin flow.
- **Data Flow Diagrams**: end-to-end from PDF upload to LLM response.

---

### `Design.doc` — System Design Document
Detailed system architecture covering:
- Component diagrams for the backend service layer.
- Database entity-relationship diagrams.
- RAG pipeline flow with fallback logic.
- API contract definitions.
- Android clean-architecture layer diagram.

---

### `Requirements.doc`
Raw requirements elicitation document — user stories, stakeholder concerns, and derived system requirements before formal SRS consolidation.

---

### `hyperparameter_documentation.md` — AI Hyperparameter Reference

The most technically detailed document in this directory. Covers **every tunable parameter** in the AI stack with full justification:

| Section | Parameters Covered |
|---|---|
| Text Chunking | `chunk_size`, `chunk_overlap`, `min_chunk_length` |
| Embedding Model | `BAAI/bge-base-en-v1.5`, normalization, LRU cache |
| Retrieval | `top_k`, `match_threshold` |
| Context Builder | `MAX_CHUNKS`, `MAX_CHUNK_CHARS`, `MAX_TOTAL_CONTEXT_CHARS` |
| LLM Generation | `DEFAULT_MODEL`, `temperature` |
| OCR Cleaning | `gemini-2.0-flash`, retries, retry delay |
| Cron Operations | `MAX_CONCURRENCY`, `REQUEST_TIMEOUT` |
| Embedding Versioning | `EMBEDDING_VERSION` scheme |

> All 20 hyperparameters are currently at their validated optimal values. Environment-configurable parameters (`RETRIEVAL_TOP_K`, `RETRIEVAL_MATCH_THRESHOLD`) can be tuned in production without code changes.

---

### `StatusTracker.xls`
The living development effort log — updated weekly with:
- **Week** header rows (Week 1 through end of semester)
- **Activity Name**: specific task completed
- **Type**: Development / Testing / Documentation / Meeting
- **Responsible**: team member
- **Est Hours** / **Actual Hours**: time tracking
- **Status**: Not Started / In Progress / Complete

> This file must have at least one commit per week. The CI/CD pipeline checks for this before creating the weekly submission snapshot tag.

---

### `TestPlan_Team48.xls`
Structured test plan covering:
- Test case IDs and descriptions
- Priority and test type (functional / integration / security)
- Pre-conditions and expected outcomes
- R1 and R2 test round results

---

### `MOMs/` — Minutes of Meetings

Records of all formal project review meetings with the course instructor:

| File | Date | Topics |
|---|---|---|
| `mom_19_jan.pdf` | January 19 | Project kickoff, scope definition, team roles |
| `MOM_16th_Feb.pdf` | February 16 | R1 progress review, architecture decisions |
| `MOM_21_March.pdf` | March 21 | Mid-term review, integration status |
| `MOM_17Apr.pdf` | April 17 | Final review, deployment, submission plan |

---

### `team_specs/`

Per-contributor technical specification documents detailing individual design decisions, implementation approaches, and testing strategies:

| File | Contributor | Primary Responsibility |
|---|---|---|
| `Tanush.md` | Tanush | AI retrieval engine (RAG + FAISS fallback), longitudinal lab tracking (SQL window functions), wearable pivot pipeline, automated summary generation, environmental context integration |
| `Aditya.md` | Aditya | Android application architecture, Jetpack Compose UI, STT/TTS voice pipeline |
| `Avnish.md` | Avnish | Doctor dashboard frontend, patient detail views, WebSocket real-time updates |
| `Rishabh.md` | Rishabh | FastAPI backend structure, Supabase auth integration, deployment |

---

### `slides/`

| File | Purpose |
|---|---|
| `slides_ocr_extraction.tex` | LaTeX source for the team presentation slide deck on the OCR and structured extraction pipeline |

---

### `admin-setup.md`
Instructions for Teaching Assistants to configure the repository correctly:
- Enabling tag protection for `submission-week-*` patterns
- Setting up branch protection rules
- Granting appropriate GitHub Actions permissions

---

### `release-labels.txt`
Optional weekly category labels included in the annotated git tag body for each submission snapshot. Allows teams to annotate releases with themes like `"Week 5: RAG Integration"` without modifying the release body directly.

---
