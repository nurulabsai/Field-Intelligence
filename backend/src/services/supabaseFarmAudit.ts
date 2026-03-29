import { supabase } from '../lib/supabase.js';

/** Boundary corner for farm_audits.boundary_corners JSONB */
interface BoundaryCorner {
  lat: number;
  lon: number;
  accuracy?: number;
  timestamp?: string;
  sequence: number;
}

/** Payload for farm_audits table (Supabase schema) */
export interface FarmAuditPayload {
  farmer_name: string;
  farmer_phone?: string;
  farm_name?: string;
  farm_latitude: number;
  farm_longitude: number;
  gps_accuracy_meters?: number;
  gps_timestamp?: string;
  gps_device_model?: string;
  boundary_corners: BoundaryCorner[];
  farm_size_reported_ha?: number;
  crops_grown: string[];
  primary_crop?: string;
  secondary_crop?: string;
  cropping_system?: string;
  soil_type?: string;
  soil_texture?: string;
  water_source?: string;
  irrigation_type?: string;
  has_storage?: boolean;
  has_fencing?: boolean;
  has_shed?: boolean;
  farm_access_road?: string;
  photos?: unknown;
  target_region: string;
  target_district?: string;
  target_ward?: string;
  target_village?: string;
  enumerator_name: string;
  enumerator_phone?: string;
  survey_date: string;
  survey_start_time?: string;
  survey_end_time?: string;
  offline_collected?: boolean;
  offline_validation_warnings?: unknown[];
}

/** API audit shape from POST /api/audits/sync */
interface ApiAudit {
  id: string;
  type: 'farm' | 'business';
  businessName: string;
  location?: { latitude: number; longitude: number; accuracy?: number; timestamp?: number };
  status: string;
  farmData?: {
    farmerFirstName?: string;
    farmerLastName?: string;
    primaryPhone?: string;
    boundaryCorners?: BoundaryCorner[];
    farmSize?: string | number;
    crops?: { type?: string }[];
    soilType?: string;
    soilTexture?: string;
    waterSourceMain?: string;
    postHarvest?: { hasStorage?: boolean };
    region?: string;
    district?: string;
    ward?: string;
    village?: string;
    auditorId?: string;
    auditDate?: string;
  };
}

/** Map API audit to farm_audits payload. Returns null if not a valid farm audit. */
export function mapApiAuditToFarmPayload(audit: ApiAudit): FarmAuditPayload | null {
  if (audit.type !== 'farm' || !audit.farmData) return null;

  const fd = audit.farmData;
  const corners = fd.boundaryCorners;

  if (!corners || corners.length < 4 || corners.length > 8) {
    console.warn('[Supabase] Farm audit missing valid boundary_corners (need 4-8)');
    return null;
  }

  let lat = 0;
  let lon = 0;
  if (audit.location?.latitude != null && audit.location?.longitude != null) {
    lat = audit.location.latitude;
    lon = audit.location.longitude;
  } else {
    lat = corners.reduce((s, c) => s + c.lat, 0) / corners.length;
    lon = corners.reduce((s, c) => s + c.lon, 0) / corners.length;
  }

  const crops = (fd.crops?.map((c) => c.type).filter((t): t is string => !!t) || []) as string[];

  return {
    farmer_name: [fd.farmerFirstName, fd.farmerLastName].filter(Boolean).join(' ').trim() || 'Unknown',
    farmer_phone: fd.primaryPhone || undefined,
    farm_name: undefined,
    farm_latitude: lat,
    farm_longitude: lon,
    gps_accuracy_meters: audit.location?.accuracy ?? corners[0]?.accuracy,
    gps_timestamp: audit.location?.timestamp ? new Date(audit.location.timestamp).toISOString() : undefined,
    boundary_corners: corners,
    farm_size_reported_ha: fd.farmSize ? parseFloat(String(fd.farmSize)) : undefined,
    crops_grown: crops.length > 0 ? crops : (['Unknown'] as string[]),
    primary_crop: crops[0],
    secondary_crop: crops[1],
    cropping_system: undefined,
    soil_type: fd.soilType || undefined,
    soil_texture: fd.soilTexture || undefined,
    water_source: fd.waterSourceMain || undefined,
    has_storage: fd.postHarvest?.hasStorage ?? false,
    has_fencing: undefined,
    has_shed: undefined,
    farm_access_road: undefined,
    target_region: fd.region || 'Morogoro',
    target_district: fd.district || undefined,
    target_ward: fd.ward || undefined,
    target_village: fd.village || undefined,
    enumerator_name: fd.auditorId || 'Unknown',
    enumerator_phone: undefined,
    survey_date: fd.auditDate ? fd.auditDate.split('T')[0] : new Date().toISOString().split('T')[0],
    offline_collected: true,
    offline_validation_warnings: [],
  };
}

export const supabaseFarmAuditService = {
  async create(payload: FarmAuditPayload): Promise<{ audit_id: string } | null> {
    if (!supabase) {
      console.warn('[Supabase] Not configured - skipping farm audit insert');
      return null;
    }

    const { data, error } = await supabase
      .from('farm_audits')
      .insert([payload])
      .select('audit_id')
      .single();

    if (error) {
      console.error('[Supabase] farm_audits insert error:', error);
      throw error;
    }

    return data;
  },
};
