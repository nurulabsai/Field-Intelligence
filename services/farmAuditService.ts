import { supabase } from '../lib/supabaseClient';
import { BoundaryCorner } from '../types';
import { AuditRecord } from '../types';

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

/** Map AuditRecord (farm) to farm_audits payload */
export function mapAuditToFarmAuditPayload(audit: AuditRecord): FarmAuditPayload | null {
  if (audit.type !== 'farm' || !audit.farmData) return null;

  const fd = audit.farmData;
  const corners = fd.boundaryCorners;

  if (!corners || corners.length < 4 || corners.length > 8) {
    console.warn('Farm audit missing valid boundary_corners (need 4-8)');
    return null;
  }

  // Use centroid from gps_location or compute from corners
  let lat = 0;
  let lon = 0;
  if (audit.location?.latitude != null && audit.location?.longitude != null) {
    lat = audit.location.latitude;
    lon = audit.location.longitude;
  } else {
    lat = corners.reduce((s, c) => s + c.lat, 0) / corners.length;
    lon = corners.reduce((s, c) => s + c.lon, 0) / corners.length;
  }

  const crops = fd.crops?.map((c) => c.type).filter(Boolean) || [];

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
    crops_grown: crops.length > 0 ? crops : ['Unknown'],
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

export const farmAuditService = {
  async create(payload: FarmAuditPayload): Promise<{ audit_id: string } | null> {
    if (!supabase) {
      console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      return null;
    }

    const { data, error } = await supabase
      .from('farm_audits')
      .insert([payload])
      .select('audit_id')
      .single();

    if (error) {
      console.error('Supabase farm_audits insert error:', error);
      throw error;
    }

    return data;
  },

  async getById(auditId: string) {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('farm_audits')
      .select('*')
      .eq('audit_id', auditId)
      .single();

    if (error) throw error;
    return data;
  },
};
