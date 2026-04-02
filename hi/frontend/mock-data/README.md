# 📦 Mock Data & Testing Payloads — HealthAI Backend Integration

**Generated:** 2026-03-05  
**For:** Person 1 (Report Upload/Extraction), Person 3 (Wearable Ingestion), Person 4 (UI Frontend)  
**Status:** Ready for Monday morning delivery

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Deliverables Summary](#deliverables-summary)
3. [Person 4 — UI Data Contracts](#person-4--ui-data-contracts)
4. [Person 3 — Wearable Data Testing](#person-3--wearable-data-testing)
5. [Person 1 — Report Extraction Testing](#person-1--report-extraction-testing)
6. [Quick Start Guide](#quick-start-guide)
7. [Integration Examples](#integration-examples)

---

## 📌 Overview

This package provides comprehensive **mock data contracts** and **testing payloads** to unblock frontend and backend development:

- **UI needs:** Exact JSON shape of doctor roster and patient details
- **Wearable API needs:** Realistic 7-day heart rate + sleep data for testing ingestion
- **Report API needs:** 3 medical reports with extracted facts for pipeline validation

All data is **production-realistic** but **entirely synthetic** — suitable for development, testing, and demos.

---

## 📦 Deliverables Summary

| File | Purpose | Audience | Format |
|------|---------|----------|--------|
| [`mock_doctor_roster.json`](#mock_doctor_rosterjson) | 5 patients with alerts for doctor dashboard | Person 4 | JSON |
| [`mock_patient_detail.json`](#mock_patient_detailjson) | Single patient view with reports & AI summary | Person 4 | JSON |
| [`generate_wearable_data.js`](#generate_wearable_datajs) | Script: 7 days of heart rate + sleep data | Person 3 | Node.js |
| [`mock_report_extractions.json`](#mock_report_extractionsjson) | 3 reports with extraction metadata | Person 1 | JSON |
| [`generate_test_pdfs.js`](#generate_test_pdfsjs) | Script: Dummy medical reports for upload testing | Person 1 | Node.js |
| `README.md` | This file | All | Markdown |

---

## 🖥️ Person 4 — UI Data Contracts

### mock_doctor_roster.json

**Purpose:** Doctor dashboard list view showing all patients under care.

**Key Features:**
- 5 patients with varying alert severities (high, medium, low)
- Chronological alerts with categories (lab, environment, activity, trend)
- Recent reports + health metrics summary
- Priority scoring for triage

**Schema Highlights:**

```json
{
  "timestamp": "2026-03-05T09:30:00Z",
  "doctorId": "doc-1",
  "patientsUnderCare": [
    {
      "patientId": "pat-1",
      "name": "Riya Sharma",
      "age": 28,
      "alertSeverity": "high",         // ← Highest unacknowledged severity
      "activeAlertsCount": 3,
      "activeAlerts": [                // ← Array of active alerts
        {
          "alertId": "alert-1",
          "severity": "high",
          "title": "Iron Deficiency Anaemia"
        }
      ],
      "recentReports": [               // ← Latest uploaded reports
        {
          "reportId": "rep-2",
          "reportType": "lipid_panel",
          "status": "ready"
        }
      ]
    }
  ],
  "metadata": {
    "totalUnderCare": 5,
    "criticalCount": 0,
    "highPriorityCount": 2
  }
}
```

**Integration Steps (Person 4):**

1. Fetch from backend: `GET /api/doctor/{doctorId}/patients`
2. Render `patientsUnderCare` as sortable table/cards
3. Color-code by `alertSeverity` (use existing `SeverityBadge` component)
4. Click → navigate to `mock_patient_detail.json` route
5. Show active alerts in modal/drawer

**Test Data Notes:**
- Riya Sharma (pat-1): High priority — 3 active alerts
- Karan Patel (pat-2): High priority — 1 alert (diabetes)
- Meera Iyer (pat-3): Medium — 1 environment alert
- Rajesh Gupta (pat-4): Medium — 2 alerts (cholesterol + activity)
- Anjali Desai (pat-5): Low — 1 trend alert

---

### mock_patient_detail.json

**Purpose:** Single patient view — full health timeline, reports, alerts, AI summaries.

**Key Features:**
- Complete patient demographics + doctor assignment
- Real-time metrics (steps, sleep, HR, environment)
- 2 detailed reports with extracted lab results + AI interpretation
- 3 contextual alerts with evidence + recommendations

**Schema Highlights:**

```json
{
  "patientId": "pat-1",
  "patientName": "Riya Sharma",
  "recentMetrics": {
    "date": "2026-03-05",
    "steps": 3200,
    "sleepHours": 4.5,
    "heartRateAvg": 78,
    "environment": {
      "temperature": 33,
      "aqi": 145
    }
  },
  "reports": [
    {
      "reportId": "rep-2",
      "reportType": "lipid_panel",
      "extractedData": {
        "testResults": [
          {
            "testName": "Total Cholesterol",
            "value": 215,
            "unit": "mg/dL",
            "status": "high"
          }
        ]
      },
      "aiSummary": "Lipid panel shows elevated cholesterol..."
    }
  ],
  "alerts": [
    {
      "alertId": "alert-1",
      "severity": "high",
      "evidence": ["Haemoglobin: 9.8 g/dL (ref 12–16)"],
      "recommendedAction": "Start ferrous sulfate supplementation..."
    }
  ]
}
```

**Integration Steps (Person 4):**

1. Route: `/doctor/patient/:patientId` → fetch from `GET /api/patients/{patientId}/detail`
2. Render left panel: patient info + recent metrics (use `PatientSummaryCard`)
3. Center: Tab layout:
   - Reports tab → timeline of `reports[]` with extracted lab values
   - Alerts tab → sortable by severity, click for evidence drawer
4. Right sidebar: AI summaries + recommended actions
5. Use existing components: `SeverityBadge`, `Card`, `Section`, `EmptyState`

**Test Data Notes:**
- Riya Sharma: Iron deficiency + heat/air quality alerts
- Shows both lab anomalies (high LDL) and environmental context
- AI summaries include actionable recommendations (medication, diet, lifestyle)

---

## 📊 Person 3 — Wearable Data Testing

### generate_wearable_data.js

**Purpose:** Generate realistic 7 days of minute-by-minute heart rate + sleep data.

**Installation:**

```bash
cd frontend/mock-data
npm install  # (if needed for dependencies)
node generate_wearable_data.js
```

**Output:** `wearable_payload.json` (1,440,576 data points!)

**Features:**
- ✅ Minute-level granularity for 7 consecutive days
- ✅ Realistic circadian patterns:
  - Sleep (11pm–6am): 55–70 bpm baseline
  - Wake (6am–8am): 65–80 bpm (getting up)
  - Active (8am–11pm): 70–100 bpm with activity spikes
- ✅ Sleep stages: awake, light, deep, REM
- ✅ Sensor metadata: device ID, confidence scores
- ✅ Summary statistics: min, max, avg, stdDev

**Payload Structure:**

```json
{
  "patientId": "pat-3",
  "dataSource": "google_fit",
  "deviceInfo": {
    "manufacturer": "Samsung",
    "model": "Galaxy Watch 6"
  },
  "dataPoints": {
    "heartRate": {
      "samplingInterval": "1m",
      "dataPoints": [
        {
          "timestamp": "2026-02-27T00:00:00Z",
          "heartRate": 62,
          "confidence": 0.97
        }
      ],
      "statistics": {
        "average": 75,
        "min": 48,
        "max": 156,
        "stdDev": 12
      }
    },
    "sleep": {
      "dataPoints": [
        {
          "timestamp": "2026-02-27T23:00:00Z",
          "stage": "light",
          "confidence": 0.94
        }
      ],
      "statistics": {
        "totalSleepHours": 7,
        "stages": {
          "awake": 120,
          "light": 180,
          "deep": 240,
          "rem": 180
        }
      }
    }
  },
  "dateRange": {
    "startDate": "2026-02-27",
    "endDate": "2026-03-05"
  }
}
```

**Integration Steps (Person 3):**

1. **Endpoint:** `POST /api/wearable/ingest`
2. **Test Flow:**
   ```bash
   # Generate data
   node generate_wearable_data.js --patient-id=pat-3
   
   # Inject into API
   curl -X POST http://localhost:8080/api/wearable/ingest \
     -H "Content-Type: application/json" \
     -d @wearable_payload.json
   ```

3. **Validation Checklist:**
   - ✅ Data points indexed by timestamp
   - ✅ Heart rate values in range [40, 180]
   - ✅ Sleep stages in set {awake, light, deep, rem}
   - ✅ Circadian pattern: lower HR during sleep, spikes during activity
   - ✅ Statistics computed correctly
   - ✅ Date range spans 7 days
   - ✅ No gaps > 2 min in timeline

4. **Data Quality Metrics:**
   - Confidence scores: 0.92–0.99 (realistic sensor accuracy)
   - Circadian pattern evident: visual check on plot
   - Activity spikes occasional (realistic user behavior)

---

## 📄 Person 1 — Report Extraction Testing

### Mock Report Extraction Payloads

**File:** `mock_report_extractions.json`

Contains 3 complete medical reports with extracted facts + AI summaries:

| Report | Type | Key Finding | Severity |
|--------|------|-------------|----------|
| **Report 001** | Thyroid | TSH 2.4 → NORMAL | Low |
| **Report 002** | Kidney Function | GFR 58 → Stage 2-3A CKD | High |
| **Report 003** | Diabetes | HbA1c 8.9% → CRITICAL | Critical |

**Extraction Schema:**

```json
{
  "reportId": "test-report-001",
  "fileName": "Thyroid_Function_Test_Mar2026.pdf",
  "reportType": "thyroid",
  "ocrRawText": "...",              // Raw OCR output for validation
  "extractedData": {
    "testType": "thyroid",
    "testDate": "2026-03-04",
    "testResults": [
      {
        "testName": "TSH",
        "value": 2.4,
        "unit": "mIU/L",
        "referenceMin": 0.4,
        "referenceMax": 4.0,
        "status": "normal"
      }
    ],
    "flags": []                      // Alert flags for rule engine
  },
  "aiSummary": "Thyroid panel is completely normal...",
  "confidence": 0.98                 // Extraction confidence
}
```

**Integration Steps (Person 1):**

1. **Upload Pipeline Test:**
   ```bash
   # Step 1: Generate dummy PDFs
   node generate_test_pdfs.js --output-dir=./test-pdfs
   
   # Step 2: Upload to backend
   for pdf in test-pdfs/*.txt; do
     curl -X POST http://localhost:8080/api/reports/upload \
       -F "file=@$pdf" \
       -F "patientId=pat-test-001"
   done
   ```

2. **Extraction Validation:**
   - ✅ OCR text extracted correctly from raw PDF
   - ✅ Lab values parsed: numeric value + unit
   - ✅ Reference ranges identified
   - ✅ Status computed (normal/low/high/critical)
   - ✅ Reports indexed by: patientId, reportType, date

3. **Test Coverage:**
   - **Report 001 (Thyroid):** All normal — should NOT trigger alerts
   - **Report 002 (Kidney):** Stage 2-3A CKD — should trigger lab alert
   - **Report 003 (Diabetes):** Critical glucose control — should trigger multiple alerts

4. **Expected API Response:**
   ```json
   {
     "status": "success",
     "reportId": "rep-extracted-001",
     "extractedData": { },
     "alerts": [
       {
         "severity": "high",
         "category": "lab",
         "title": "Elevated HbA1c"
       }
     ]
   }
   ```

**PDF Test Files:**

Run this to create dummy reports:

```bash
node generate_test_pdfs.js
# Creates:
#   - test-pdfs/Thyroid_Function_Test_Mar2026.txt
#   - test-pdfs/Kidney_Function_Test_Feb2026.txt
#   - test-pdfs/Diabetes_Monitoring_Panel_Jan2026.txt
```

---

## 🚀 Quick Start Guide

### For Person 4 (UI Team) — Monday Morning

**What you need:**
- `mock_doctor_roster.json` — Doctor dashboard patient list
- `mock_patient_detail.json` — Patient detail page

**Action items:**
1. Copy both JSON files to `frontend/public/mock-data/`
2. Update API routes to serve from static files OR mock backend
3. Test rendering:
   ```bash
   # In Next.js page component
   const roster = require('@/public/mock-data/mock_doctor_roster.json');
   const detail = require('@/public/mock-data/mock_patient_detail.json');
   ```
4. Verify:
   - Doctor dashboard renders 5 patients sorted by priority
   - Patient detail shows reports + alerts
   - All badge colors match design system

---

### For Person 3 (Wearable API) — Monday Morning

**What you need:**
- `generate_wearable_data.js` — Data generator script
- `wearable_payload.json` — Generated output (from running the script)

**Action items:**
1. Run generator:
   ```bash
   node mock-data/generate_wearable_data.js
   ```
2. Test your ingestion API:
   ```bash
   curl -X POST http://localhost:8080/api/wearable/ingest \
     -H "Content-Type: application/json" \
     -d @mock-data/wearable_payload.json
   ```
3. Verify database:
   - 7 days of data inserted
   - Minute-level timeline integrity
   - No duplicate timestamps
   - Circadian pattern visible in visualization

**Customization:**
```bash
# Different patient ID
node mock-data/generate_wearable_data.js --patient-id=pat-5

# Different output file
node mock-data/generate_wearable_data.js --output=alternative_payload.json
```

---

### For Person 1 (Report Upload/Extraction) — Monday Morning

**What you need:**
- `generate_test_pdfs.js` — PDF generator
- `mock_report_extractions.json` — Reference extraction payloads

**Action items:**
1. Generate test PDFs:
   ```bash
   node mock-data/generate_test_pdfs.js
   # Creates test-pdfs/
   ```
2. Test your upload endpoint:
   ```bash
   curl -X POST http://localhost:8080/api/reports/upload \
     -F "file=@mock-data/test-pdfs/Thyroid_Function_Test_Mar2026.txt" \
     -F "patientId=pat-test-001"
   ```
3. Validate extraction:
   - Extracted data matches `mock_report_extractions.json`
   - Lab values parsed correctly
   - Alerts triggered per rule engine
   - Confidence scores in range [0.9, 1.0]

**Test Coverage Matrix:**

| File | Expected Status | Alert Count | Key Alert |
|------|-----------------|-------------|-----------|
| Thyroid | Normal | 0 | None |
| Kidney | High (CKD) | 1 | High CKD Flag |
| Diabetes | Critical | 3+ | Critical HbA1c + Lipid Dyslipidemia + CAD Risk |

---

## 🔗 Integration Examples

### Example 1: Doctor Dashboard Integration (Person 4)

```tsx
// app/doctor/page.tsx
import roster from '@/public/mock-data/mock_doctor_roster.json';

export default function DoctorDashboard() {
  return (
    <div>
      <h1>Patients Under Care: {roster.metadata.totalUnderCare}</h1>
      
      {roster.patientsUnderCare.map(patient => (
        <PatientCard
          key={patient.patientId}
          patient={patient}
          severity={patient.alertSeverity}
          alertCount={patient.activeAlertsCount}
        />
      ))}
    </div>
  );
}
```

### Example 2: Wearable Ingestion Test (Person 3)

```python
# Backend: test_wearable_api.py
import json
import requests

with open('wearable_payload.json') as f:
    payload = json.load(f)

response = requests.post(
    'http://localhost:8080/api/wearable/ingest',
    json=payload
)

assert response.status_code == 201
assert len(payload['dataPoints']['heartRate']['dataPoints']) >= 10080  # 7 days * 1440 mins
print("✅ Wearable ingestion test passed!")
```

### Example 3: Report Extraction Validation (Person 1)

```python
# Backend: test_report_extraction.py
import json
from pdf_processor import extract_report

with open('mock_report_extractions.json') as f:
    reference = json.load(f)

for report in reference['reports']:
    extracted = extract_report(f"test-pdfs/{report['fileName']}.txt")
    
    # Validate key fields
    assert extracted['testType'] == report['extractedData']['testType']
    assert len(extracted['testResults']) == len(report['extractedData']['testResults'])
    assert extracted['confidence'] >= 0.90
    
print(f"✅ All {len(reference['reports'])} reports extracted correctly!")
```

---

## 📞 Support & Questions

**Monday Sync Agenda:**

1. **Person 4** (UI):
   - Confirm JSON schema matches your component props
   - Test browser rendering with mock data
   - Validate alert/severity styling

2. **Person 3** (Wearable):
   - Run generator with your patient ID
   - Test database ingestion
   - Verify circadian pattern in visualization

3. **Person 1** (Reports):
   - Run PDF generator in your environment
   - Test OCR extraction accuracy
   - Validate alert triggering logic

**Troubleshooting:**

| Issue | Solution |
|-------|----------|
| `Cannot find module (mock-data)` | Ensure `mock-data/` folder exists in `frontend/` |
| `PDF not extracting` | Check that PDFs are valid text files (not binary) |
| `Wearable data too large` | Reduce date range or sampling interval |
| `Alerts not triggering` | Cross-reference alert logic with `DEMO_ALERTS` in `lib/demo-data.ts` |

---

## 📝 Data Privacy & Licensing

- ✅ All data is **fully synthetic** — no real patient information
- ✅ Safe for demo, testing, and documentation
- ✅ Use in development, staging, and public demos
- ⚠️ Do NOT use in production without anonymization

---

**Generated by:** Mock Data Generator  
**Version:** 1.0  
**Last Updated:** 2026-03-05  
**Ready for Delivery:** ✅ YES
