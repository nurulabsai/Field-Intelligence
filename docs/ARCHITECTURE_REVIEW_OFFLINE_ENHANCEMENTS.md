# Architecture Review & Offline Enhancements for Audit Forms

**Project:** NuruOS Field Intelligence  
**Date:** 2025-03-10  
**Focus:** No-connectivity audit form collection

---

## 1. Current Architecture Summary

### 1.1 Data Flow (As Implemented)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  PagedForm      │────▶│  FarmAuditForm   │────▶│  onSave (App)   │
│  (formState)    │     │  mapToAuditRecord │     │  ⚠️ NO-OP       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                          │
        │ draft                    │
        ▼                          ▼
┌─────────────────┐     ┌──────────────────┐
│  localStorage   │     │  IndexedDB       │
│  draft_farm_*   │     │  (never called   │
│  (ephemeral)    │     │   from App)      │
└─────────────────┘     └──────────────────┘
```

### 1.2 Storage Layer

| Store        | Purpose                    | Offline Support |
|-------------|----------------------------|------------------|
| `audits`    | Full audit records         | ✅ IndexedDB     |
| `images`    | Base64 / URLs per audit    | ✅ IndexedDB     |
| `ai_queue`  | Pending AI (voice/photo)   | ✅ Queued        |
| `localStorage` | User, draft_*, ENC_KEY  | ✅ Persistent    |

### 1.3 Sync Flow

- **Trigger:** Manual (Sync Status screen) or implicit via `processSyncQueue`
- **Condition:** `navigator.onLine` must be true
- **Steps:** Upload images → Supabase/Sheets → Mark `status = 'synced'`
- **Retry:** Up to 5 attempts, status flips between `pending` and `failed`

### 1.4 Form Draft Handling

- **Auto-save:** `PagedFormContainer` writes to `localStorage` under `draft_${template.id}`
- **Resume:** On mount, prompts "Resume previous Farm Audit?" if draft exists
- **Save Draft button:** Calls `onSaveDraft` → parent maps to `handleSubmit(data, true)` → `onSave(record)` → **App's no-op**
- **Submit:** Same path; audit never reaches IndexedDB from current App wiring

---

## 2. Critical Gaps (No-Connectivity)

### 2.1 App Does Not Persist or Load Audits

**Issue:** `App.tsx` passes `audits={[]}` and `onSaveAudit={async () => { }}`. Audits are never:
- Loaded from IndexedDB on mount
- Saved when user submits a form

**Impact:** All form submissions are lost. Dashboard always shows 0 audits.

### 2.2 Drafts Are Ephemeral

**Issue:** Drafts live only in `localStorage`. They are:
- Lost if user clears site data
- Not encrypted (unlike IndexedDB audits)
- Limited to ~5MB total
- Not included in backup/restore

### 2.3 Reference Data Not Cached

**Issue:** Region/district/ward options are:
- Hardcoded (`DISTRICTS_BY_REGION` in validationService) for a subset
- Not loaded from `dim_locations` (Supabase) for offline use
- No pre-cache of reference data before going to the field

### 2.4 AI Requires Network

**Issue:** Voice transcription and photo analysis call Gemini API. When offline:
- Requests are queued in `ai_queue`
- User gets no feedback; features appear broken
- No fallback (e.g., "Analyze when online")

### 2.5 Maps Require Network

**Issue:** Google Maps loads from CDN. When offline:
- `LocationPicker` falls back to sensor-only (good)
- No map tiles, no boundary preview on map
- No offline basemap (e.g., cached tiles, static image)

### 2.6 No Automatic Sync on Reconnect

**Issue:** Sync only runs when user opens Sync Status. There is no:
- `online` event listener to trigger `processSyncQueue`
- Background sync when app regains connectivity

### 2.7 Service Worker Gaps

**Issue:** Current SW:
- Pre-caches only `./` and `./index.html`
- Does not cache Vite JS/CSS bundles (app may not load offline)
- No offline fallback page
- No cache for API responses or reference data

### 2.8 No Offline UX Indicators

**Issue:** Form does not clearly communicate:
- "You are offline – data will sync when connected"
- "AI analysis will run when online"
- Pending sync count on dashboard (data exists but isn't wired)

---

## 3. Proposed Enhancements

### 3.1 Wire App to IndexedDB (Critical)

**Change:** Load audits from IndexedDB on mount; persist on save.

```tsx
// App.tsx
const [audits, setAudits] = useState<AuditRecord[]>([]);

useEffect(() => {
  getAllAudits().then(setAudits);
}, []);

const handleSaveAudit = async (audit: AuditRecord) => {
  audit.status = audit.status || 'pending';
  await saveAuditLocally(audit);
  setAudits(prev => [...prev.filter(a => a.id !== audit.id), audit]);
};
```

**Impact:** Submissions persist; dashboard shows real data; sync queue works.

---

### 3.2 IndexedDB Drafts (Replace localStorage)

**Change:** Persist in-progress forms to IndexedDB instead of localStorage.

- Add `drafts` store: `{ id, templateId, formState, updatedAt }`
- Auto-save every 30s to IndexedDB
- On mount, check for draft and offer resume
- On submit, delete draft and save to `audits`
- Encrypt draft if it contains PII

**Benefits:** Survives clear-data, backup/restore, no size limit per origin.

---

### 3.3 Reference Data Cache

**Change:** Pre-cache location hierarchy for offline use.

- **New store:** `reference_data` with keys `dim_locations`, `dim_crops`, etc.
- **Sync when online:** Fetch from Supabase on app load or in Settings
- **Fallback:** Use hardcoded `DISTRICTS_BY_REGION` if cache empty
- **UI:** "Pre-load data for offline" button in Settings/Admin

```ts
// New: services/referenceDataService.ts
export const cacheLocations = async () => {
  const { data } = await supabase.from('dim_locations').select('*');
  await saveToIndexedDB('reference_data', 'dim_locations', data);
};
export const getDistrictsForRegion = async (region: string) => {
  const cached = await getFromIndexedDB('reference_data', 'dim_locations');
  return cached?.filter(l => l.region === region) ?? DISTRICTS_BY_REGION[region];
};
```

---

### 3.4 Graceful AI Offline Handling

**Change:** Make AI behavior explicit when offline.

- **Voice:** Show "Voice note saved. Will transcribe when online." Queue to `ai_queue`.
- **Photo analysis:** Show "Photo saved. AI analysis will run when online." Queue to `ai_queue`.
- **Validation:** Skip AI validation when offline; rely on client-side rules only.
- **UI:** Badge on AI Copilot: "Offline – queued for later" when `!navigator.onLine`.

---

### 3.5 Offline Map Fallback

**Change:** Improve map experience when offline.

- **Option A:** Cache static map tiles for target regions (complex)
- **Option B:** Use sensor-only mode with clear messaging: "Map unavailable offline. GPS still works."
- **Option C:** Simple SVG/Canvas boundary preview (corners + polygon) – no basemap
- **Recommendation:** B + C. Sensor-only is already implemented; add a minimal boundary preview (e.g., scaled coordinates on canvas) for BoundarySection.

---

### 3.6 Auto-Sync on Reconnect

**Change:** Trigger sync when `online` event fires.

```ts
// App.tsx or syncService
useEffect(() => {
  const handleOnline = () => {
    setOnline(true);
    processSyncQueue((msg) => console.log('[Sync]', msg));
  };
  window.addEventListener('online', handleOnline);
  return () => window.removeEventListener('online', handleOnline);
}, []);
```

**Consideration:** Avoid syncing while user is mid-form. Option: delay 5s after `online`, or only sync when user navigates away from form.

---

### 3.7 Service Worker Enhancements

**Change:** Make app loadable and usable offline.

- **Precache:** Add `dist/assets/*.js`, `dist/assets/*.css` to install (or use Workbox `precacheAndRoute`)
- **Navigation fallback:** Already returns `index.html` on fetch failure
- **Runtime cache:** Cache `loadGoogleMaps` script if used (optional)
- **Skip:** Do not cache API calls (Supabase, Gemini) – those must fail offline

```js
// service-worker.js – extend PRECACHE_URLS
const PRECACHE_URLS = [
  './',
  './index.html',
  // Add hashed assets from build manifest if available
];
```

---

### 3.8 Offline UX Indicators

**Change:** Surface connectivity and sync status in the UI.

- **Banner:** "You're offline. Data will sync when connected." (sticky when `!navigator.onLine`)
- **Dashboard:** "X audits pending sync" – ensure it uses real data from IndexedDB
- **Form header:** Small icon (e.g., cloud-off) when offline
- **Sync screen:** "Last synced: never" or timestamp; "Sync when online" disabled state

---

### 3.9 Conflict Resolution (Future)

**Change:** Handle edits both offline and on server.

- **Optimistic:** Assume last-write-wins for now
- **Advanced:** Store `updatedAt`; on sync, compare with server; if server newer, prompt "Conflict – keep local or server?"
- **Farm audits:** Usually create-only; conflicts less likely than business audits

---

### 3.10 Storage Quota & Backup

**Change:** Proactively manage storage and backups.

- **Quota check:** Call `navigator.storage.estimate()`; warn when usage > 80% of quota
- **Export:** "Export all audits" → JSON file (already have `restoreBackup` for import)
- **Cleanup:** Option to delete synced audits from IndexedDB to free space (keep metadata)

---

## 4. Implementation Priority

| Priority | Enhancement                    | Effort | Impact |
|----------|--------------------------------|--------|--------|
| P0       | Wire App to IndexedDB          | Low    | Critical – fixes data loss |
| P1       | Auto-sync on reconnect         | Low    | High – seamless sync      |
| P1       | Offline UX indicators          | Low    | High – user confidence    |
| P2       | IndexedDB drafts               | Medium | High – robust drafts      |
| P2       | Graceful AI offline handling   | Low    | Medium – clear expectations |
| P3       | Reference data cache           | Medium | Medium – better dropdowns |
| P3       | Service worker precache        | Medium | Medium – app loads offline |
| P4       | Boundary preview (no map)      | Low    | Low – nice-to-have        |
| P4       | Conflict resolution            | High   | Low – rare case           |

---

## 5. Recommended Architecture (Target State)

```
┌─────────────────────────────────────────────────────────────────┐
│                         App (Root)                                │
│  - Load audits from IndexedDB on mount                            │
│  - Listen to online/offline → trigger sync / show banner         │
│  - onSaveAudit → saveAuditLocally + setState                     │
└─────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  IndexedDB    │         │  SyncService    │         │  ReferenceData  │
│  audits       │◀───────▶│  (on reconnect)│         │  (cached)       │
│  images       │         │  Supabase/     │         │  dim_locations  │
│  drafts       │         │  Sheets        │         │  dim_crops      │
│  ai_queue     │         └─────────────────┘         └─────────────────┘
│  reference_*  │
└───────────────┘
        │
        │  Offline-first: all writes go to IDB first
        │  Sync: batch upload when online
        ▼
┌───────────────┐
│  Supabase     │
│  farm_audits  │
└───────────────┘
```

---

## 6. Summary

The main blocker for no-connectivity audit forms is that **App does not load or save audits**. Fixing that (P0) is essential. After that, auto-sync on reconnect and offline UX indicators (P1) make the experience smooth. IndexedDB drafts and AI offline handling (P2) improve robustness. Reference data cache and service worker precache (P3) complete the offline story for field use.
