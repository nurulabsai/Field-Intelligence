/**
 * Entity-driven types for the extended farm audit workflow.
 *
 * Hierarchy:
 *   Farm → FarmBoundary
 *        → Plot[] → PlotObservation[]
 *
 * Every entity carries a local temp ID (generated client-side) that
 * becomes the foreign key for child records. On submission Supabase
 * resolves these to real database IDs.
 */

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export interface GpsPoint {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: string;
}

export interface GpsBoundaryPoint extends GpsPoint {
  sequence: number;
}

export type BoundaryCaptureMethod = 'walk' | 'corner' | 'quick';
export type BoundaryStatus = 'draft' | 'complete' | 'skipped';
export type PlotStatus = 'active' | 'fallow' | 'prepared' | 'abandoned';
export type FarmingSystem = 'rainfed' | 'irrigated' | 'mixed';
export type TenureType = 'owned' | 'leased' | 'communal' | 'government' | 'borrowed' | 'other';
export type CropCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
export type StressLevel = 'none' | 'low' | 'moderate' | 'high' | 'severe';
export type GrowthStage =
  | 'germination'
  | 'vegetative'
  | 'flowering'
  | 'fruiting'
  | 'maturity'
  | 'harvest'
  | 'post_harvest';

// ---------------------------------------------------------------------------
// Farm Profile
// ---------------------------------------------------------------------------

export interface FarmProfile {
  id: string;
  farm_name: string;
  farmer_name: string;
  farmer_phone: string;
  village: string;
  ward: string;
  district: string;
  region: string;
  total_area_ha: number | '';
  tenure_type: TenureType | '';
  farming_system: FarmingSystem | '';
  contact_number: string;
  water_source: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Farm Boundary
// ---------------------------------------------------------------------------

export interface GpsAccuracySummary {
  min: number;
  max: number;
  avg: number;
  count: number;
}

export interface FarmBoundary {
  id: string;
  farm_id: string;
  capture_method: BoundaryCaptureMethod | '';
  points: GpsBoundaryPoint[];
  status: BoundaryStatus;
  confidence: 'high' | 'medium' | 'low' | '';
  captured_at: string;
  captured_by: string;
  gps_accuracy_summary: GpsAccuracySummary | null;
  area_ha: number | null;
  notes: string;
  skip_reason: string;
}

// ---------------------------------------------------------------------------
// Plot
// ---------------------------------------------------------------------------

export interface Plot {
  id: string;
  farm_id: string;
  name: string;
  area_ha: number | '';
  status: PlotStatus | '';
  current_crop: string;
  variety: string;
  growth_stage: GrowthStage | '';
  irrigation_status: 'irrigated' | 'rainfed' | 'supplemental' | '';
  center_gps: GpsPoint | null;
  planting_season: string;
  photo: string;
  notes: string;
}

// ---------------------------------------------------------------------------
// Plot Observation
// ---------------------------------------------------------------------------

export interface PlotObservation {
  id: string;
  plot_id: string;
  plot_name: string;
  crop_condition: CropCondition | '';
  pest_present: boolean | null;
  disease_present: boolean | null;
  pest_type: string;
  pest_severity: StressLevel | '';
  disease_type: string;
  disease_severity: StressLevel | '';
  stress_level: StressLevel | '';
  plant_vigor: 'excellent' | 'good' | 'fair' | 'poor' | '';
  soil_moisture: 'saturated' | 'wet' | 'moist' | 'dry' | 'very_dry' | '';
  weed_pressure: StressLevel | '';
  yield_outlook: 'above_average' | 'average' | 'below_average' | 'crop_failure' | '';
  notes: string;
  photo: string;
  voice_note: string;
}

// ---------------------------------------------------------------------------
// Form state shape (extends existing flat Record<string, unknown>)
// ---------------------------------------------------------------------------

export interface AuditExtendedState {
  farm_profile: FarmProfile;
  farm_boundary: FarmBoundary;
  plots: Plot[];
  plot_observations: PlotObservation[];
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

function tempId(): string {
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createFarmProfile(): FarmProfile {
  return {
    id: tempId(),
    farm_name: '',
    farmer_name: '',
    farmer_phone: '',
    village: '',
    ward: '',
    district: '',
    region: '',
    total_area_ha: '',
    tenure_type: '',
    farming_system: '',
    contact_number: '',
    water_source: '',
    notes: '',
  };
}

export function createFarmBoundary(farmId: string): FarmBoundary {
  return {
    id: tempId(),
    farm_id: farmId,
    capture_method: '',
    points: [],
    status: 'draft',
    confidence: '',
    captured_at: '',
    captured_by: '',
    gps_accuracy_summary: null,
    area_ha: null,
    notes: '',
    skip_reason: '',
  };
}

export function createPlot(farmId: string, index: number): Plot {
  return {
    id: tempId(),
    farm_id: farmId,
    name: `Plot ${index + 1}`,
    area_ha: '',
    status: '',
    current_crop: '',
    variety: '',
    growth_stage: '',
    irrigation_status: '',
    center_gps: null,
    planting_season: '',
    photo: '',
    notes: '',
  };
}

export function createPlotObservation(plot: Plot): PlotObservation {
  return {
    id: tempId(),
    plot_id: plot.id,
    plot_name: plot.name,
    crop_condition: '',
    pest_present: null,
    disease_present: null,
    pest_type: '',
    pest_severity: '',
    disease_type: '',
    disease_severity: '',
    stress_level: '',
    plant_vigor: '',
    soil_moisture: '',
    weed_pressure: '',
    yield_outlook: '',
    notes: '',
    photo: '',
    voice_note: '',
  };
}

// ---------------------------------------------------------------------------
// Backend payload shape (for submission)
// ---------------------------------------------------------------------------

export interface AuditSubmissionPayload {
  audit_id: string;

  farm: {
    local_id: string;
    farm_name: string;
    farmer_name: string;
    farmer_phone: string;
    village: string;
    ward: string;
    district: string;
    region: string;
    total_area_ha: number;
    tenure_type: string;
    farming_system: string;
    contact_number?: string;
    water_source?: string;
    notes?: string;
  };

  farm_boundary: {
    local_id: string;
    farm_local_id: string;
    capture_method: string;
    points: GpsBoundaryPoint[];
    status: string;
    confidence: string;
    captured_at: string;
    captured_by: string;
    gps_accuracy_summary: GpsAccuracySummary | null;
    area_ha: number | null;
    notes?: string;
    skip_reason?: string;
  };

  plots: Array<{
    local_id: string;
    farm_local_id: string;
    name: string;
    area_ha: number;
    status: string;
    current_crop: string;
    variety?: string;
    growth_stage: string;
    irrigation_status: string;
    center_gps: GpsPoint | null;
    planting_season?: string;
    notes?: string;
  }>;

  plot_observations: Array<{
    local_id: string;
    plot_local_id: string;
    observed_at: string;
    crop_condition: string;
    pest_present: boolean;
    disease_present: boolean;
    pest_type?: string;
    pest_severity?: string;
    disease_type?: string;
    disease_severity?: string;
    stress_level?: string;
    plant_vigor?: string;
    soil_moisture?: string;
    weed_pressure?: string;
    yield_outlook?: string;
    notes?: string;
  }>;
}
