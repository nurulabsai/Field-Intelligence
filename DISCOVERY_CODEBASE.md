# DISCOVERY: Codebase Analysis

**Project:** NuruOS Field Intelligence  
**Date:** 2025-03-10

---

## 1. Tech Stack Summary

| Category | Technology |
|----------|------------|
| Framework | React 19 + Vite 6 |
| Routing | react-router-dom v7 |
| UI Icons | lucide-react |
| PDF Export | jspdf, jspdf-autotable |
| ZIP | jszip |
| EXIF/GPS in photos | piexifjs |
| AI | @google/genai |
| Maps | Google Maps (loadGoogleMaps) - optional, falls back to sensor-only |

---

## 2. Form Patterns

### Form Library
- **No react-hook-form, Formik, or similar** – custom form state via `useState` in `PagedFormContainer`
- **Question-driven:** `farmAuditQuestions` array defines fields; `QuestionRenderer` renders by type
- **Conditional visibility:** `condition: { field, operator, value }` on questions

### Question Types
- `text`, `textarea`, `number`, `select`, `multiselect`, `boolean`, `date`
- **`gps`** – uses `LocationPicker` (single point capture)
- **`photo`** – photo capture with AI analysis
- `task_list`, `info`

### Validation
- `validationService.ts`: `validateGPS`, `validatePhone`, `validateNumeric`
- GPS: Tanzania bounds, accuracy ≤100m (error if >100m), warning if >20m
- `PagedFormContainer` calls `validateGPS` for gps type, blocks navigation on error

### File Structure
```
/components
  FarmAuditForm.tsx      # Uses PagedFormContainer + farmAuditTemplate
  PagedFormContainer.tsx # Multi-page form with AI, voice, validation
  QuestionRenderer.tsx   # Renders by question type
  LocationPicker.tsx     # GPS single-point capture (map + sensor fallback)
  ai/                    # VoiceInputButton, AIAssistantPanel, AIValidationAlert
/data
  farmAuditQuestions.ts  # Question definitions (no boundary_corners yet)
/services
  storageService.ts      # IndexedDB (audits, images)
  syncService.ts         # Google Sheets sync
  validationService.ts   # validateGPS, validatePhone, etc.
  db.ts                  # IndexedDB init
  apiClient.ts           # Backend API (sync, upload) - optional
  googleSheetsService.ts # Current sync target
```

---

## 3. Location / GPS

### Current Implementation
- **LocationPicker.tsx**: Single-point GPS capture
  - `navigator.geolocation.getCurrentPosition` with `enableHighAccuracy: true`
  - Optional Google Maps display (falls back to sensor-only if API key fails)
  - `LocationData`: `{ latitude, longitude, accuracy?, timestamp? }`
  - "Capture GPS" / "Update GPS" button
  - Accuracy slider for testing (5–150m)
  - Simulate location for testing (Morogoro coords)

### No Existing
- No boundary/corner collection
- No multi-point GPS collection
- No turf.js or PostGIS client-side

---

## 4. Offline Storage

### IndexedDB (db.ts)
- **DB_NAME:** AuditProDB, **DB_VERSION:** 2
- **Stores:** `audits` (keyPath: id), `images` (keyPath: id, index: auditId), `ai_queue`
- **storageService.ts:** `saveAuditLocally`, `getAllAudits`, `getAuditById`, `getPendingSyncs`, `deleteAudit`
- **Encryption:** `securityService` – `secureAuditData` / `unsecureAuditData` for sensitive fields

### localStorage
- `audit_pro_user` – user session
- `draft_*` – offline AI drafts (offlineAIService)
- `ENC_KEY_STORAGE` – encryption key (securityService)

### No Dexie
- Raw IndexedDB via `getDB()` and transactions

---

## 5. Sync Flow

### Current
1. `syncService.processSyncQueue()` → `getPendingSyncs()` (status = 'pending')
2. For each audit: `syncImagesForAudit` (R2 upload), then `submitAuditToGoogleSheets`
3. Mark `status = 'synced'` in IndexedDB

### Backend API (apiClient)
- `syncAudit(audit)`, `batchSyncAudits(audits)` → POST `/api/audits/sync`
- Not wired to main sync flow; Google Sheets is primary

### Supabase
- **Not used in frontend** – no Supabase client
- farm_audits table exists in Supabase; sync target per spec

---

## 6. State Management

- **No Redux/Zustand** – React `useState` / `useContext` where needed
- `App.tsx`: user, online state; passes to `AppRoutes`
- Form state in `PagedFormContainer` (`formState`, `setFormState`)

---

## 7. Map Components

- **LocationPicker** – Google Maps (optional) + GPS sensor
- No Leaflet, Mapbox, or other map libs
- `mapsLoader.ts` – loads Google Maps script

---

## 8. Dependencies to Add

| Package | Purpose |
|---------|---------|
| @turf/turf | Polygon area, validation, centroid |
| @supabase/supabase-js | Supabase client for farm_audits sync |
| dexie (optional) | Simpler IndexedDB – or keep raw IDB |
| zod (optional) | Schema validation – or keep custom |

---

## 9. Existing Reusable Pieces

- `LocationPicker` – GPS capture logic (can extract `getCurrentPosition` into hook)
- `validateGPS` – accuracy/bounds checks
- `PagedFormContainer` – add new question type `boundary` or new section
- `QuestionRenderer` – extend for `boundary` type
- `storageService` – extend AuditRecord or add farm_audits-specific store
- `DISTRICTS_BY_REGION` in validationService – region→district mapping
