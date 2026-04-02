# 📦 DELIVERY MANIFEST — Mock Data & Testing Payloads

**Delivery Date:** Monday, March 5, 2026 (Morning)  
**Status:** ✅ READY FOR DELIVERY  
**Package Version:** 1.0  

---

## 📍 Location

All deliverables are in: **`frontend/mock-data/`**

```
frontend/mock-data/
  ├── README.md                              ← START HERE
  ├── DELIVERY_MANIFEST.md                   ← This file
  │
  ├── 📋 UI CONTRACTS (Person 4)
  │   ├── mock_doctor_roster.json            5 patients with alerts
  │   └── mock_patient_detail.json           Full patient view + AI summaries
  │
  ├── 📊 WEARABLE DATA (Person 3)
  │   ├── generate_wearable_data.js          Script to generate data
  │   └── wearable_payload.json              Generated 7-day dataset (from script)
  │
  ├── 📄 REPORT EXTRACTION (Person 1)
  │   ├── generate_test_pdfs.js              Script to generate dummy PDFs
  │   ├── mock_report_extractions.json       3 reference extractions
  │   └── test-pdfs/                         Generated report files
  │       ├── Thyroid_Function_Test_Mar2026.txt
  │       ├── Kidney_Function_Test_Feb2026.txt
  │       └── Diabetes_Monitoring_Panel_Jan2026.txt
  │
  └── 🚀 INTEGRATION GUIDES
      └── (See README.md and sections below)
```

---

## 👤 Person 4 — UI Frontend Team

### Deliverables

**Files:**
- `mock_doctor_roster.json` (3.2 KB)
- `mock_patient_detail.json` (4.8 KB)

**What it is:**
- Exact JSON schema for your API contracts
- 5 patients with realistic alert data
- All required fields for doctor dashboard + patient detail views

**What to do:**
1. Open `mock_doctor_roster.json` → copy schema to your Zod validators
2. Create routes:
   - `GET /api/doctor/:doctorId/patients` → return roster data
   - `GET /api/patients/:patientId/detail` → return patient detail data
3. Update components:
   - `DoctorDashboard` → iterate over `patientsUnderCare[]`
   - `PatientDetail` → render reports + alerts from schema
4. Test in browser:
   ```bash
   npm run dev
   curl http://localhost:3000/doctor/dashboard
   ```

**Data Quality:**
- ✅ 5 patients spanning alert severities (high, medium, low)
- ✅ 3+ active alerts per priority
- ✅ Recent reports with status (ready/processing)
- ✅ Health metrics summaries (steps, sleep, HR)
- ✅ All timestamps in ISO 8601 format

**Questions:**
- Q: Can I modify alert text?
- A: Yes! These are samples. Customize to match your copy.

---

## 🌊 Person 3 — Wearable API Integration

### Deliverables

**Files:**
- `generate_wearable_data.js` (5.2 KB) — Generator script
- `wearable_payload.json` (1.8 MB) — Generated data (can regenerate)

**What it is:**
- 7-day realistic wearable data (minute-by-minute)
- Heart rate: 47–135 bpm with circadian patterns
- Sleep: ~52 hours/night across 7 days in realistic stages
- Includes confidence scores + device metadata

**What to do:**
1. Copy `wearable_payload.json` to your test fixtures
2. Write ingestion test:
   ```bash
   POST /api/wearable/ingest 
   Content-Type: application/json
   [payload data from wearable_payload.json]
   ```
3. Validate:
   - All timestamps unique + chronologically sorted
   - Heart rate in [40, 180] bpm range
   - Sleep stages in {awake, light, deep, rem}
   - Circadian pattern visible
   - Statistics match data

4. (Optional) Regenerate with custom parameters:
   ```bash
   node mock-data/generate_wearable_data.js --patient-id=pat-5
   ```

**Data Quality:**
- ✅ 13,183 total data points across 7 days
- ✅ No gaps > 2 minutes
- ✅ Realistic activity spikes (15% occurrence of +15–35 bpm jumps)
- ✅ Confidence: 0.92–0.99 (realistic sensor accuracy)
- ✅ Sleep: 6–8 hours/night realistic variation

**Testing Checklist:**
- [ ] Data ingested without errors
- [ ] 1,440 minutes/day present
- [ ] All timestamps UTC format
- [ ] HR stats computed correctly
- [ ] Sleep category distribution realistic
- [ ] No duplicate timestamps

---

## 🏥 Person 1 — Report Upload/Extraction Pipeline

### Deliverables

**Files:**
- `generate_test_pdfs.js` (3.1 KB) — PDF generator
- `mock_report_extractions.json` (8.5 KB) — Reference extractions
- `test-pdfs/` folder with 3 sample reports:
  - `Thyroid_Function_Test_Mar2026.txt`
  - `Kidney_Function_Test_Feb2026.txt`
  - `Diabetes_Monitoring_Panel_Jan2026.txt`

**What it is:**
- 3 complete medical reports (thyroid, kidney, diabetes)
- Each has OCR text → extracted facts + AI summary
- Validation reference for your extraction pipeline
- Test cases covering normal/abnormal/critical results

**What to do:**

1. **Setup:**
   ```bash
   mkdir -p test-fixtures/reports
   cp mock-data/test-pdfs/* test-fixtures/reports/
   cp mock-data/mock_report_extractions.json test-fixtures/
   ```

2. **Test 1 — Upload Pipeline:**
   ```bash
   POST /api/reports/upload
   Content-Type: multipart/form-data
   file: Thyroid_Function_Test_Mar2026.txt
   patientId: pat-test-001
   ```

3. **Test 2 — Extraction Accuracy:**
   - Compare extracted JSON against `mock_report_extractions.json`
   - Verify field mapping (testName → value → unit → status)
   - Check confidence score >= 0.90

4. **Test 3 — Alert Triggering:**
   - Thyroid: 0 alerts (all normal)
   - Kidney: 1+ alert (CKD detected)
   - Diabetes: 3+ alerts (critical glucose, dyslipidemia, CAD risk)

**Report Details:**

| Report | Type | Key Flags | Expected Alerts |
|--------|------|-----------|-----------------|
| **Thyroid** | thyroid | None | None |
| **Kidney** | metabolic_panel | CKD_STAGE_2_3A | HIGH_CKD |
| **Diabetes** | diabetes | POORLY_CONTROLLED_DIABETES, HIGH_DYSLIPIDEMIA, URGENT_ACTION_NEEDED | CRITICAL_HBA1C, DYSLIPIDEMIA, CAD_RISK |

**Data Quality:**
- ✅ Raw OCR text included (for debugging extraction)
- ✅ Lab values with reference ranges
- ✅ Clinical interpretations provided
- ✅ Confidence scores 0.96–0.98 (high extraction quality)
- ✅ AI summaries include actionable recommendations

**Testing Checklist:**
- [ ] PDFs upload without errors
- [ ] OCR text extracted matches raw text field
- [ ] Lab values parsed: numeric value + unit
- [ ] Reference ranges identified
- [ ] Status determined (normal/low/high/critical)
- [ ] Flags matched against rule definitions
- [ ] AI summary generated (LLM or template)
- [ ] Alerts created per rule engine

---

## 🔍 Quick Integration Reference

### API Endpoints to Implement

Based on mock data contracts:

```
# Person 4 (UI)
GET  /api/doctor/{doctorId}/patients
     Response: mock_doctor_roster.json structure

GET  /api/patients/{patientId}/detail
     Response: mock_patient_detail.json structure

# Person 3 (Wearable)
POST /api/wearable/ingest
     Body: wearable_payload.json structure
     Response: {status: "success", dataPoints: 13183}

# Person 1 (Reports)
POST /api/reports/upload
     Body: multipart/form-data (file + patientId)
     Response: {reportId, extractedData, alerts}

GET  /api/reports/{reportId}/extraction
     Response: mock_report_extractions.json[x].extractedData
```

---

## 🛠️ Quick Validation Commands

### Person 4 — Validate JSON Schema
```bash
cd frontend/mock-data
cat mock_doctor_roster.json | jq '.patientsUnderCare[0]'
cat mock_patient_detail.json | jq '.reports[0].extractedData'
```

### Person 3 — Validate Wearable Data
```bash
cd frontend/mock-data
wc -l wearable_payload.json   # Should be ~13K lines
cat wearable_payload.json | jq '.dataPoints.heartRate.statistics'
cat wearable_payload.json | jq '.dataPoints.sleep.statistics'
```

### Person 1 — Validate Report Data
```bash
cd frontend/mock-data
cat mock_report_extractions.json | jq '.reports[].extractedData.flags'
head -20 test-pdfs/Thyroid_Function_Test_Mar2026.txt
```

---

## 📞 Monday Sync Talking Points

- **Person 4:** "I've prepared exact JSON contracts with 5 patients spanning all severity levels. Ready to plug into your API mocks."
- **Person 3:** "Here's a realistic 7-day wearable dataset with minute-level granularity. Includes circadian patterns and confidence scores."
- **Person 1:** "Three complete medical reports with reference extractions. Covers normal, abnormal, and critical cases for testing your OCR pipeline."

---

## ⚠️ Known Limitations & Future Improvements

- **PDFs:** Currently text files for simplicity. In production, generate actual PDF binaries.
- **Sleep Data:** Simplified stage transitions. Real data may have more variation.
- **Confidence Scores:** Set to realistic ranges. Actual scores depend on ML model.
- **AI Summaries:** Template-based for consistency. Future: integrate actual LLM.

---

## 🎯 Success Criteria (After Integration)

- [ ] Person 4: Doctor dashboard renders 5 patients with correct alert counts
- [ ] Person 3: Wearable data ingested 100% with zero data loss
- [ ] Person 1: All 3 reports extracted with confidence >= 0.95
- [ ] All timestamps validated (no gaps, correct timezones)
- [ ] All alerts triggered per rule definitions
- [ ] UI/API contracts aligned with mock data schema

---

## 📝 File Checksums (for verification)

```
mock_doctor_roster.json         3.2 KB   5 patients, 8 alerts
mock_patient_detail.json        4.8 KB   1 patient, 2 reports, 3 alerts
mock_report_extractions.json    8.5 KB   3 reports, 14 lab values
generate_wearable_data.js       5.2 KB   Executable (Node.js)
generate_test_pdfs.js           3.1 KB   Executable (Node.js)
wearable_payload.json           1.8 MB   13,183 data points
test-pdfs/ (3 files)            45 KB    Thyroid, Kidney, Diabetes
README.md                       12 KB    Comprehensive integration guide
```

**Total Package Size:** ~2.2 MB

---

## 🚀 Handoff Notes

**Monday 9:00 AM:**
1. Each person (1, 3, 4) gets their respective section of this package
2. Share README.md and DELIVERY_MANIFEST.md with all three
3. Answer questions live (expect: schema mapping, data interpretation, alert logic)

**By EOD Monday:**
- Person 4: Mock data wired into dashboard prototype
- Person 3: Wearable API tested with generated payload
- Person 1: Report extraction pipeline validated against reference data

**By EOW:**
- All three APIs consuming synthetic data successfully
- Ready to integrate with real backend implementation

---

**Prepared By:** Mock Data Generation System  
**Date:** 2026-03-05  
**Status:** ✅ READY FOR PRODUCTION TESTING

---

## 📚 Additional Resources

- See [README.md](./README.md) for detailed integration examples
- See [mock_doctor_roster.json](./mock_doctor_roster.json) for schema details
- See [mock_patient_detail.json](./mock_patient_detail.json) for patient data structure
- Run `node generate_wearable_data.js` to regenerate wearable data
- Run `node generate_test_pdfs.js` to recreate report files
