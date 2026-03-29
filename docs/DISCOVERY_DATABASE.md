# DISCOVERY: Database Schema Analysis

**Project:** NuruOS Field Intelligence  
**Supabase Project ID:** gyekncktmsvdtcbhakgl  
**Date:** 2025-03-10

---

## 1. farm_audits Table Schema

### Identity & Farmer
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| audit_id | uuid | NO | gen_random_uuid() |
| farm_name | varchar | YES | - |
| farmer_name | varchar | NO | - |
| farmer_phone | varchar | YES | - |
| farmer_national_id | varchar | YES | - |

### GPS & Boundary (CRITICAL for this feature)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| farm_latitude | numeric | NO | - |
| farm_longitude | numeric | NO | - |
| gps_accuracy_meters | numeric | YES | - |
| gps_timestamp | timestamptz | YES | - |
| gps_device_model | varchar | YES | - |
| **boundary_corners** | **jsonb** | **NO** | - |
| corner_count | integer | YES | - |
| boundary_field_collected | geometry | YES | - |
| boundary_satellite_digitized | geometry | YES | - |
| boundary_satellite_source | varchar | YES | - |
| boundary_satellite_resolution_m | numeric | YES | - |
| boundary_satellite_date | date | YES | - |
| boundary_digitized_by | varchar | YES | - |
| boundary_digitized_at | timestamptz | YES | - |
| boundary_final | geometry | YES | - |
| farm_centroid | geometry | YES | - |

### Farm Details
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| farm_size_reported_ha | numeric | YES | - |
| crops_grown | text[] | NO | - |
| primary_crop | varchar | YES | - |
| secondary_crop | varchar | YES | - |
| cropping_system | varchar | YES | - |
| soil_type | varchar | YES | - |
| soil_texture | varchar | YES | - |
| soil_color | varchar | YES | - |
| water_source | varchar | YES | - |
| irrigation_type | varchar | YES | - |
| has_storage | boolean | YES | false |
| has_fencing | boolean | YES | false |
| has_shed | boolean | YES | false |
| farm_access_road | varchar | YES | - |
| infrastructure_notes | jsonb | YES | - |
| photos | jsonb | YES | - |
| photo_count | integer | YES | - |

### Location
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| target_region | varchar | NO | - |
| target_district | varchar | YES | - |
| target_ward | varchar | YES | - |
| target_village | varchar | YES | - |
| is_within_target_district | boolean | YES | - |

### Validation (Server-Side)
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| validation_flags | jsonb | YES | '[]' |
| data_quality_score | numeric | YES | - |
| validation_status | varchar | YES | 'pending' |
| nearest_neighbor_distance_m | numeric | YES | - |
| is_potential_duplicate | boolean | YES | false |

### Enumerator
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| enumerator_id | uuid | YES | - |
| enumerator_name | varchar | NO | - |
| enumerator_phone | varchar | YES | - |
| survey_date | date | NO | - |
| survey_start_time | time | YES | - |
| survey_end_time | time | YES | - |
| survey_duration_minutes | integer | YES | - |

### Offline & Sync
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| offline_collected | boolean | YES | true |
| offline_validation_warnings | jsonb | YES | '[]' |
| kobo_submission_id | varchar | YES | - |
| kobo_form_version | varchar | YES | - |
| raw_kobo_payload | jsonb | YES | - |
| sync_timestamp | timestamptz | YES | - |
| sync_method | varchar | YES | - |
| source_id | varchar | YES | 'src_aje_farms' |

### Metadata
| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| promoted_to_actor_id | uuid | YES | - |
| promoted_at | timestamptz | YES | - |
| promotion_status | varchar | YES | 'pending' |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| created_by | uuid | YES | - |
| updated_by | uuid | YES | - |
| internal_notes | text | YES | - |
| farmer_feedback | text | YES | - |

---

## 2. Triggers on farm_audits

| Trigger Name | Function | Purpose |
|--------------|----------|---------|
| trg_farm_audits_updated_at | update_farm_audits_timestamp | Auto-update updated_at |
| **trg_generate_boundary_from_corners** | **generate_boundary_from_corners** | **Generates polygon from boundary_corners JSONB** |
| **trg_validate_farm_geofence** | **validate_farm_audit_geofence** | **Validates farm is within district boundary** |
| RI_ConstraintTrigger_* | RI_FKey_check_* | Foreign key checks |

---

## 3. Related Tables

| Table | Purpose |
|-------|---------|
| dim_locations | Location hierarchy (regions, districts, wards) |
| dim_actors | Farmer/actor records (promotion target) |
| dim_crops | Crop reference data |
| dim_markets | Market reference |
| v_location_hierarchy | View for location hierarchy |
| vw_farm_audits_ready_for_promotion | View for promotion workflow |
| vw_farm_audits_regional_summary | Regional summary view |

---

## 4. boundary_corners Expected Format

Based on spec and PostGIS conventions, `boundary_corners` JSONB should be an array of objects:

```json
[
  { "lat": -7.470123, "lon": 39.180456, "accuracy": 8.5, "timestamp": "2025-03-10T09:23:15Z", "sequence": 1 },
  { "lat": -7.470234, "lon": 39.181123, "accuracy": 7.2, "timestamp": "2025-03-10T09:24:30Z", "sequence": 2 },
  ...
]
```

- **Required:** 4-8 corners
- **Server trigger** generates `boundary_field_collected` (PostGIS polygon) from corners
- **Server trigger** validates centroid is within `target_district` boundary

---

## 5. Key Findings

1. **boundary_corners is NOT NULL** – must always provide at least 4 corners
2. **Server-side polygon generation** – no client-side PostGIS needed
3. **Geofence validation** – server validates district boundary
4. **No Supabase client in frontend** – app currently syncs via Google Sheets; Supabase integration needs to be added
5. **dim_locations** – can be used for district dropdown population
