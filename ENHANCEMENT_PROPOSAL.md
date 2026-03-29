# ENHANCEMENT PROPOSAL: Farm Boundary Collection

**Project:** NuruOS Field Intelligence  
**Date:** 2025-03-10

---

## 2.1 Architecture Decisions

### Form Library
- **Current:** Custom form state in PagedFormContainer, question-driven
- **Recommendation:** Keep existing pattern; add new question type `boundary` to farmAuditQuestions
- **Rationale:** Consistency with current form UX; boundary is a special section, not a simple field

### Offline Storage
- **Current:** IndexedDB (audits, images) via storageService
- **Recommendation:** Extend AuditRecord.farmData with `boundaryCorners`; store in existing audits store
- **Rationale:** Reuse encryption, sync queue, and structure; no new Dexie dependency

### GPS Collection
- **Current:** LocationPicker uses navigator.geolocation for single point
- **Recommendation:** Extract `useGPSLocation` hook; reuse for corner capture; add BoundarySection component
- **Rationale:** Same API, same accuracy options; BoundarySection = repeated "Add Corner" with list + preview

### Validation Strategy
- **Client-side:** Corner count 4–8, GPS accuracy warnings, area sanity check (turf.js)
- **Server-side:** Already implemented via triggers (polygon generation, geofence, duplicates)
- **Offline warnings:** Non-blocking; allow save with warnings

### State Management
- **Current:** React useState in PagedFormContainer
- **Recommendation:** Store `boundary_corners` in formState under `boundary_corners`; map to farmData in mapToAuditRecord
- **Rationale:** Fits existing flat formState → FarmAuditData mapping

### Supabase Sync
- **Current:** Google Sheets only
- **Recommendation:** Add Supabase client; sync farm audits with boundary_corners to farm_audits table when online
- **Rationale:** Spec requires Supabase; farm_audits schema is ready; can run in parallel with Sheets for transition

---

## 2.2 Component Structure

```
/src
  /components
    FarmAuditForm.tsx           # Existing – add boundary mapping
    PagedFormContainer.tsx     # Existing – support boundary question type
    QuestionRenderer.tsx       # Existing – add case 'boundary'
    BoundarySection.tsx        # NEW – corner collection UI
    LocationPicker.tsx         # Existing – single point (centroid)
  /hooks
    useGPSLocation.ts          # NEW – extracted from LocationPicker logic
  /services
    farmAuditService.ts        # NEW – Supabase farm_audits CRUD
    storageService.ts          # Existing – extend for boundary in farmData
    validationService.ts       # Existing – add validateBoundaryCorners
  /data
    farmAuditQuestions.ts      # Add boundary_corners question after gps_location
  /types
    types.ts                  # Add BoundaryCorner, extend FarmAuditData
```

---

## 2.3 Data Flow

### Create New Farm Audit (Offline)
1. User opens form (existing flow)
2. Section A: Location – gps_location (centroid), region, district, ward, village
3. **NEW Section: Boundary** – Add 4–8 corners via "Add Corner" (GPS)
4. Each corner: getCurrentPosition → append to boundary_corners
5. Client calculates area (turf.area), shows warnings
6. Save to IndexedDB (extend farmData.boundaryCorners)
7. Status = 'pending' for sync

### Sync to Supabase (Online)
1. Detect connectivity
2. For pending farm audits with boundary_corners:
   - Map to farm_audits schema (farmer_name, farm_latitude, farm_longitude, boundary_corners, etc.)
   - INSERT into farm_audits
3. Triggers: generate_boundary_from_corners, validate_farm_audit_geofence
4. Update local status to 'synced', store audit_id

### Offline Validation
- Corner count: 4–8 (critical if <4)
- GPS accuracy: warn if any corner >50m
- Area: sanity check vs farm_size_reported_ha
- Non-blocking warnings

---

## 2.4 Key Features

### 1. Corner Point Collection
- [x] "Add Corner" button
- [x] Read GPS (lat, lon, accuracy)
- [x] Accuracy indicator (excellent/good/fair/poor)
- [x] Corner sequence (1–8)
- [x] Edit/delete/reorder corners
- [x] Area calculation (turf)
- [x] Validation warnings

### 2. GPS Integration
- [x] navigator.geolocation (existing pattern)
- [x] Accuracy, timestamp per corner
- [ ] External GPS (future)

### 3. Offline-First
- [x] IndexedDB via existing storageService
- [x] Draft vs Complete
- [x] Sync queue

### 4. Supabase Sync
- [x] farmAuditService.create()
- [x] Map AuditRecord → farm_audits schema

### 5. Map Preview
- [ ] Mini-map (optional – can use LocationPicker pattern or simple static map URL)
