# Farm Boundary Collection - Testing Checklist

## Unit Tests

### BoundarySection Component
- [ ] Renders with empty corners
- [ ] Adds corner with GPS reading
- [ ] Removes corner
- [ ] Reorders corners (up/down)
- [ ] Shows validation warnings for <4 corners
- [ ] Shows validation warnings for >8 corners
- [ ] Shows validation warnings for poor GPS accuracy (>50m)
- [ ] Calculates area correctly for 4-corner polygon
- [ ] Calculates area correctly for irregular polygon
- [ ] Disables "Add Corner" when 8 corners reached

### useGPSLocation Hook
- [ ] Returns GPS position successfully
- [ ] Handles permission denied error
- [ ] Handles position unavailable error
- [ ] Handles timeout error
- [ ] Returns correct structure (latitude, longitude, accuracy, timestamp)

### Offline Storage (IndexedDB)
- [ ] Saves farm audit with boundary_corners to IndexedDB
- [ ] Retrieves farm audit by ID with boundaryCorners
- [ ] Lists all farm audits
- [ ] Lists pending sync audits (status = 'pending')
- [ ] boundaryCorners preserved through encrypt/decrypt

### farmAuditService
- [ ] mapAuditToFarmAuditPayload returns null for non-farm audit
- [ ] mapAuditToFarmAuditPayload returns null when <4 corners
- [ ] mapAuditToFarmAuditPayload maps AuditRecord to FarmAuditPayload correctly
- [ ] create() succeeds when Supabase configured
- [ ] create() returns null when Supabase not configured (no throw)

## Integration Tests

### Form Workflow
- [ ] Opens Farm Audit form
- [ ] Fills Section A (GPS, region, district, ward, village)
- [ ] Reaches boundary_corners question
- [ ] Adds 4 valid corners via "Add Corner"
- [ ] Sees area calculated
- [ ] Can proceed to next section (validation passes)
- [ ] Cannot proceed with <4 corners (validation blocks)
- [ ] Saves as draft with boundary_corners
- [ ] Submits successfully when all required fields filled

### Sync Flow
- [ ] Farm audit with 4 boundary corners syncs to Supabase when online
- [ ] Sync falls back to Google Sheets when Supabase not configured
- [ ] Sync falls back to Google Sheets when Supabase fails
- [ ] Audit marked as 'synced' after successful sync
- [ ] supabaseAuditId stored when Supabase sync succeeds

### Validation
- [ ] Blocks navigation with <4 corners (required)
- [ ] Blocks navigation with >8 corners
- [ ] Blocks submit with <4 corners
- [ ] Shows warnings for poor GPS accuracy (non-blocking)
- [ ] GPS centroid from gps_location used when available
- [ ] Centroid computed from corners when gps_location missing

## Edge Cases

### GPS
- [ ] Handles GPS permission denied gracefully
- [ ] Handles GPS timeout gracefully
- [ ] Handles very poor accuracy (>100m) - warning shown
- [ ] Works in sensor-only mode (no map)

### Boundary
- [ ] Handles corners in wrong order (reorder works)
- [ ] Handles collinear points (area may be ~0)
- [ ] Handles very small area (<0.01 ha)
- [ ] Handles large area (>50 ha)

### Offline/Online
- [ ] Form works completely offline
- [ ] Saves to IndexedDB offline
- [ ] Syncs when connection restored
- [ ] Pending count updates after sync

## Manual Testing

### Device
- [ ] Test on Chrome/Edge (desktop)
- [ ] Test on Safari
- [ ] Test on Android Chrome (real GPS)
- [ ] Test on iOS Safari (real GPS)
- [ ] Use "Mock Location" for testing without GPS

### Supabase
- [ ] Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
- [ ] Submit farm audit with 4 corners
- [ ] Verify row in farm_audits table
- [ ] Verify boundary_field_collected populated (trigger)
- [ ] Verify validation_status set by trigger

## Data Integrity

- [ ] No data loss on page refresh (draft in IndexedDB)
- [ ] boundary_corners format matches Supabase schema
- [ ] Corner sequence 1..N preserved
- [ ] Timestamps in ISO format
