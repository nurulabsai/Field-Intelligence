import type { FarmerProfile } from './farmerTypes';

// ─── Geo primitives ───────────────────────────────────────────────────────────

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy: number;
  altitude?: number;
  capturedAt: string;
}

export interface GeoPolygon {
  points: GeoPoint[];
  area?: number;
}

// ─── Farm enums ───────────────────────────────────────────────────────────────

export type FarmTenure = 'owned' | 'leased' | 'communal' | 'customary' | 'other';
export type FarmingSystem = 'rainfed' | 'irrigated' | 'mixed';
export type WaterSource = 'rain' | 'river' | 'borehole' | 'dam' | 'canal' | 'none';
export type BoundaryMethod = 'walk' | 'corner_points' | 'quick_draft';
export type BoundaryStatus = 'not_started' | 'in_progress' | 'draft' | 'complete' | 'skipped';
export type PlotStatus = 'active' | 'fallow' | 'prepared' | 'abandoned';
export type GrowthStage =
  | 'pre_planting' | 'germination' | 'vegetative' | 'flowering'
  | 'fruiting' | 'maturity' | 'harvest' | 'post_harvest';
export type IrrigationStatus = 'rainfed' | 'irrigated' | 'partial';
export type CropCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'failed';
export type StressLevel = 'none' | 'mild' | 'moderate' | 'severe';
export type WeedPressure = 'none' | 'low' | 'moderate' | 'high';
export type YieldOutlook = 'above_average' | 'average' | 'below_average' | 'crop_failure';

// ─── Farm Profile ─────────────────────────────────────────────────────────────

export interface FarmProfile {
  farmerLocalId: string;
  farmLocalRef: string;
  farmerName: string;
  farmerContact: string;
  region: string;
  district: string;
  ward: string;
  village: string;
  totalAreaHa: number;
  tenureType: FarmTenure;
  farmingSystem: FarmingSystem;
  waterSource?: WaterSource;
  notes?: string;
  capturedAt: string;
  capturedBy: string;
}

// ─── Farm Boundary ────────────────────────────────────────────────────────────

export interface FarmBoundaryDraft {
  farmLocalRef: string;
  method: BoundaryMethod;
  status: BoundaryStatus;
  polygon: GeoPolygon | null;
  capturedAt: string;
  capturedBy: string;
  gpsAccuracySummary: { min: number; max: number; avg: number } | null;
  confidenceScore: number | null;
  skipReason?: string;
  notes?: string;
}

// ─── Plot ─────────────────────────────────────────────────────────────────────

export interface Plot {
  localId: string;
  farmLocalRef: string;
  plotName: string;
  areaHa: number;
  status: PlotStatus;
  currentCrop: string;
  variety?: string;
  growthStage: GrowthStage;
  irrigationStatus: IrrigationStatus;
  plantingMonth?: string;
  centerPoint: GeoPoint | null;
  photoUrl?: string;
  notes?: string;
  observation: PlotObservation;
}

// ─── Plot Observation ─────────────────────────────────────────────────────────

export interface PlotObservation {
  plotLocalId: string;
  farmLocalRef: string;
  auditId: string;
  cropCondition: CropCondition | null;
  pestPresent: boolean | null;
  diseasePresent: boolean | null;
  pestType?: string;
  pestSeverity?: StressLevel;
  diseaseType?: string;
  diseaseSeverity?: StressLevel;
  visibleStressLevel?: StressLevel;
  soilMoistureImpression?: 'dry' | 'adequate' | 'waterlogged';
  weedPressure?: WeedPressure;
  plantVigor?: 'strong' | 'moderate' | 'weak';
  yieldOutlook?: YieldOutlook;
  photoUrl?: string;
  voiceNoteUrl?: string;
  aiAnalysisSummary?: string;
  notes?: string;
}

// ─── Master Audit Form State ──────────────────────────────────────────────────

export interface AuditFormState {
  auditId: string;
  auditType: 'farm' | 'business';
  auditorId: string;
  startedAt: string;
  lastSavedAt: string;
  currentStepIndex: number;
  completedSteps: number[];
  stepErrors: Record<number, string[]>;

  farmer: FarmerProfile | null;
  farmProfile: FarmProfile | null;
  farmBoundary: FarmBoundaryDraft | null;
  plots: Plot[];

  existingSections: Record<string, unknown>;
}

// ─── Step definitions ─────────────────────────────────────────────────────────

export const FARM_AUDIT_STEPS = [
  { index: 1, key: 'farmer_profile',    label: 'Farmer',       icon: 'person'       },
  { index: 2, key: 'farm_profile',      label: 'Farm',         icon: 'agriculture'  },
  { index: 3, key: 'farm_boundary',     label: 'Boundary',     icon: 'fence'        },
  { index: 4, key: 'plot_structure',    label: 'Plots',        icon: 'grid_view'    },
  { index: 5, key: 'plot_observations', label: 'Observations', icon: 'visibility'   },
  { index: 6, key: 'media',            label: 'Media',        icon: 'photo_camera' },
  { index: 7, key: 'soil_samples',     label: 'Soil',         icon: 'grass'        },
  { index: 8, key: 'review',           label: 'Review',       icon: 'task_alt'     },
] as const;

// ─── Factory helpers ──────────────────────────────────────────────────────────

export function createEmptyPlot(farmLocalRef: string, auditId: string): Plot {
  const localId = crypto.randomUUID();
  return {
    localId,
    farmLocalRef,
    plotName: '',
    areaHa: 0,
    status: 'active',
    currentCrop: '',
    growthStage: 'vegetative',
    irrigationStatus: 'rainfed',
    centerPoint: null,
    observation: createEmptyObservation(localId, farmLocalRef, auditId),
  };
}

export function createEmptyObservation(
  plotLocalId: string,
  farmLocalRef: string,
  auditId: string
): PlotObservation {
  return {
    plotLocalId,
    farmLocalRef,
    auditId,
    cropCondition: null,
    pestPresent: null,
    diseasePresent: null,
  };
}
