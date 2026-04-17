/**
 * Supabase Client & Typed Query Helpers
 * NuruOS Field Intelligence
 */

import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ---------------------------------------------------------------------------
// Row types (mirrors the key database tables)
// ---------------------------------------------------------------------------

export interface UserRow {
  id: string;
  auth_id: string;
  organization_id: string | null;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface FarmRow {
  id: string;
  farmer_name: string;
  farmer_phone: string | null;
  region_id: string | null;
  village: string | null;
  area_ha: number | null;
  created_at: string;
  updated_at: string;
}

export interface FarmAuditRow {
  id: string;
  campaign_id: string | null;
  farm_id: string;
  workflow_template_id: string;
  assigned_to: string | null;
  status: 'assigned' | 'in_progress' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'requires_correction';
  audit_location: unknown | null;
  gps_accuracy_m: number | null;
  started_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuditFindingRow {
  id: string;
  audit_id: string;
  farm_id: string;
  finding_type: string;
  severity: string;
  description: string;
  created_at: string;
}

export interface AuditPhotoRow {
  id: string;
  audit_id: string;
  farm_id: string;
  storage_path: string;
  caption: string | null;
  created_at: string;
}

export interface CropRow {
  id: string;
  name_en: string;
  name_sw: string | null;
  crop_type: string | null;
  yield_unit: string | null;
}

export interface RegionRow {
  id: string;
  name: string;
  admin_level: number | null;
  parent_id: string | null;
}

export interface DimLocationRow {
  location_id: string;
  name: string;
  name_sw: string | null;
  admin_level: number | null;
}

export interface TaskRow {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  assigned_to: string | null;
  due_date: string | null;
  status: string;
  created_at: string;
}

export interface MarketPriceRow {
  id: string;
  crop_id: string;
  market_name: string;
  region_id: string | null;
  price_per_kg: number;
  price_date: string;
}

export interface WeatherObservationRow {
  id: string;
  region_id: string;
  observation_date: string;
  rainfall_mm: number | null;
  temperature_max_c: number | null;
  temperature_min_c: number | null;
}

/** Maps to the `tasks` table in the DB */
export interface ScheduleEventRow {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  description: string | null;
  assigned_to: string | null;
  due_date: string | null;
  priority: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

export const auth = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async resetPassword(email: string) {
    const redirectTo = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/login`
      : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// ---------------------------------------------------------------------------
// Profile queries
// ---------------------------------------------------------------------------

export const profiles = {
  async getProfile(authId: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(
    authId: string,
    updates: Partial<Pick<UserRow, 'full_name' | 'phone'>>,
  ): Promise<UserRow> {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('auth_id', authId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

// ---------------------------------------------------------------------------
// Dashboard queries
// ---------------------------------------------------------------------------

export const dashboard = {
  async getStats(userId: string) {
    const [auditsRes, farmsRes, pendingRes] = await Promise.all([
      supabase
        .from('farm_audits')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', userId),
      supabase.from('farms').select('id', { count: 'exact', head: true }),
      supabase
        .from('farm_audits')
        .select('id', { count: 'exact', head: true })
        .eq('assigned_to', userId)
        .in('status', ['assigned', 'in_progress']),
    ]);

    return {
      totalAudits: auditsRes.count ?? 0,
      totalFarms: farmsRes.count ?? 0,
      pendingAudits: pendingRes.count ?? 0,
    };
  },

  async getRecentAudits(userId: string, limit = 10): Promise<FarmAuditRow[]> {
    const { data, error } = await supabase
      .from('farm_audits')
      .select('*')
      .eq('assigned_to', userId)
      .order('updated_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async getCropPrices(regionId?: string, limit = 20): Promise<MarketPriceRow[]> {
    let query = supabase
      .from('market_prices')
      .select('*')
      .order('price_date', { ascending: false })
      .limit(limit);

    if (regionId) {
      query = query.eq('region_id', regionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Audit queries
// ---------------------------------------------------------------------------

const DEFAULT_WORKFLOW_TEMPLATE_ID = 'a9f2ddbe-8186-4472-87f8-0bb42ed279cc';

export const audits = {
  async list(
    userId: string,
    opts: { status?: string; limit?: number; offset?: number } = {},
  ): Promise<{ data: FarmAuditRow[]; count: number }> {
    const { status, limit = 50, offset = 0 } = opts;

    let query = supabase
      .from('farm_audits')
      .select('*', { count: 'exact' })
      .eq('assigned_to', userId)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data ?? [], count: count ?? 0 };
  },

  async getById(auditId: string): Promise<FarmAuditRow | null> {
    const { data, error } = await supabase
      .from('farm_audits')
      .select('*')
      .eq('id', auditId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(
    audit: Omit<FarmAuditRow, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<FarmAuditRow> {
    const row = {
      ...audit,
      workflow_template_id: audit.workflow_template_id || DEFAULT_WORKFLOW_TEMPLATE_ID,
    };
    const { data, error } = await supabase
      .from('farm_audits')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(
    auditId: string,
    updates: Partial<FarmAuditRow>,
  ): Promise<FarmAuditRow> {
    const { data, error } = await supabase
      .from('farm_audits')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', auditId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async submit(auditId: string): Promise<FarmAuditRow> {
    return this.update(auditId, {
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    } as Partial<FarmAuditRow>);
  },
};

// ---------------------------------------------------------------------------
// Findings & Photos (audit sub-resources)
// ---------------------------------------------------------------------------

export const findings = {
  async listByAudit(auditId: string): Promise<AuditFindingRow[]> {
    const { data, error } = await supabase
      .from('audit_findings')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(finding: Omit<AuditFindingRow, 'id' | 'created_at'>): Promise<AuditFindingRow> {
    const { data, error } = await supabase
      .from('audit_findings')
      .insert(finding)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const photos = {
  async listByAudit(auditId: string): Promise<AuditPhotoRow[]> {
    const { data, error } = await supabase
      .from('audit_photos')
      .select('*')
      .eq('audit_id', auditId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async create(photo: Omit<AuditPhotoRow, 'id' | 'created_at'>): Promise<AuditPhotoRow> {
    const { data, error } = await supabase
      .from('audit_photos')
      .insert(photo)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

const AUDIT_PHOTOS_BUCKET =
  (import.meta.env.VITE_SUPABASE_AUDIT_PHOTOS_BUCKET as string | undefined)?.trim() ||
  'audit-photos';

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  if (!res.ok) throw new Error('Invalid photo data');
  return res.blob();
}

/**
 * Upload one yield-step photo (data URL from Step6) to Supabase Storage and insert audit_photos.
 * Requires a public or signed bucket policy for authenticated users (see Supabase dashboard).
 */
const ALLOWED_PHOTO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadAuditPhotoFromDataUrl(
  auditId: string,
  farmId: string,
  dataUrl: string,
  caption: string | null,
): Promise<AuditPhotoRow> {
  const blob = await dataUrlToBlob(dataUrl);
  const mime = blob.type || 'image/jpeg';

  if (!ALLOWED_PHOTO_MIMES.has(mime)) {
    throw new Error(`Unsupported image type: ${mime}. Allowed: JPEG, PNG, WebP.`);
  }
  if (blob.size > MAX_PHOTO_BYTES) {
    throw new Error(
      `Photo exceeds 10 MB limit (${(blob.size / 1024 / 1024).toFixed(1)} MB). Compress before uploading.`,
    );
  }

  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg';
  const path = `${auditId}/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(AUDIT_PHOTOS_BUCKET).upload(path, blob, {
    contentType: mime,
    upsert: false,
  });
  if (upErr) throw upErr;

  return photos.create({
    audit_id: auditId,
    farm_id: farmId,
    storage_path: path,
    caption,
  });
}

/** Upload all data-URL photos from wizard formData (yield step). No-ops if none. */
export async function uploadYieldPhotosFromFormData(
  auditId: string,
  farmId: string,
  formData: Record<string, unknown>,
): Promise<void> {
  const raw = formData.photos;
  if (!Array.isArray(raw) || raw.length === 0) return;

  let i = 0;
  for (const item of raw) {
    if (typeof item !== 'string' || !item.startsWith('data:')) continue;
    i += 1;
    await uploadAuditPhotoFromDataUrl(auditId, farmId, item, `yield_${i}`);
  }
}

// ---------------------------------------------------------------------------
// Schedule / Events
// ---------------------------------------------------------------------------

export const schedule = {
  async getEvents(
    userId: string,
    opts: { from?: string; to?: string } = {},
  ): Promise<ScheduleEventRow[]> {
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', userId)
      .order('due_date', { ascending: true });

    if (opts.from) {
      query = query.gte('due_date', opts.from);
    }
    if (opts.to) {
      query = query.lte('due_date', opts.to);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []) as ScheduleEventRow[];
  },

  async createEvent(
    event: Omit<ScheduleEventRow, 'id' | 'created_at' | 'updated_at'>,
  ): Promise<ScheduleEventRow> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        entity_type: event.entity_type ?? 'schedule',
        entity_id: event.entity_id ?? '',
        title: event.title,
        description: event.description,
        assigned_to: event.assigned_to,
        due_date: event.due_date,
        priority: event.priority ?? 'medium',
        status: event.status ?? 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data as ScheduleEventRow;
  },

  async updateEvent(
    eventId: string,
    updates: Partial<ScheduleEventRow>,
  ): Promise<ScheduleEventRow> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        due_date: updates.due_date,
        status: updates.status,
      })
      .eq('id', eventId)
      .select()
      .single();
    if (error) throw error;
    return data as ScheduleEventRow;
  },

  async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', eventId);
    if (error) throw error;
  },
};

// ---------------------------------------------------------------------------
// Farm Boundaries
// ---------------------------------------------------------------------------

export interface FarmBoundaryRow {
  id: string;
  farm_id: string;
  version: number | null;
  status: string;
  capture_method: string;
  polygon: unknown | null;
  area_ha: number | null;
  perimeter_m: number | null;
  mean_accuracy_m: number | null;
  max_accuracy_m: number | null;
  point_count: number | null;
  captured_by: string | null;
  captured_at: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  client_id: string | null;
  created_at: string;
  updated_at: string;
}

export const farmBoundaries = {
  async create(boundary: Omit<FarmBoundaryRow, 'id' | 'created_at'>): Promise<FarmBoundaryRow> {
    const { data, error } = await supabase
      .from('farm_boundaries')
      .insert(boundary)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getByFarm(farmId: string): Promise<FarmBoundaryRow[]> {
    const { data, error } = await supabase
      .from('farm_boundaries')
      .select('*')
      .eq('farm_id', farmId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Plots
// ---------------------------------------------------------------------------

export interface PlotRow {
  id: string;
  farm_id: string;
  plot_name: string;
  crop_id: string | null;
  boundary: unknown | null;
  area_ha: number | null;
  planting_date: string | null;
  expected_harvest_date: string | null;
  properties: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const plots = {
  async create(plot: Omit<PlotRow, 'id' | 'created_at' | 'updated_at'>): Promise<PlotRow> {
    const { data, error } = await supabase
      .from('plots')
      .insert(plot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createMany(plotList: Omit<PlotRow, 'id' | 'created_at' | 'updated_at'>[]): Promise<PlotRow[]> {
    const { data, error } = await supabase
      .from('plots')
      .insert(plotList)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async listByFarm(farmId: string): Promise<PlotRow[]> {
    const { data, error } = await supabase
      .from('plots')
      .select('*')
      .eq('farm_id', farmId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Plot Observations
// ---------------------------------------------------------------------------

export interface PlotObservationRow {
  id: string;
  plot_id: string;
  audit_id: string | null;
  crop_condition: string;
  pest_present: boolean;
  disease_present: boolean;
  pest_type: string | null;
  pest_severity: string | null;
  disease_type: string | null;
  disease_severity: string | null;
  stress_level: string | null;
  plant_vigor: string | null;
  soil_moisture: string | null;
  weed_pressure: string | null;
  yield_outlook: string | null;
  notes: string | null;
  observed_at: string;
  created_at: string;
}

export const plotObservations = {
  async create(obs: Omit<PlotObservationRow, 'id' | 'created_at'>): Promise<PlotObservationRow> {
    const { data, error } = await supabase
      .from('plot_observations')
      .insert(obs)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async createMany(obsList: Omit<PlotObservationRow, 'id' | 'created_at'>[]): Promise<PlotObservationRow[]> {
    const { data, error } = await supabase
      .from('plot_observations')
      .insert(obsList)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async listByPlot(plotId: string): Promise<PlotObservationRow[]> {
    const { data, error } = await supabase
      .from('plot_observations')
      .select('*')
      .eq('plot_id', plotId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// dim_actors — farmer identity (separate from audits; multi-farm / OR-TAMISEMI)
// Requires migration `supabase/migrations/001_dim_actors.sql`
// ---------------------------------------------------------------------------

export interface DimActorRow {
  id: string;
  phone_e164: string;
  full_name: string | null;
  gender: string | null;
  date_of_birth: string | null;
  national_id: string | null;
  created_at: string;
  updated_at: string;
}

export const dimActors = {
  /** Returns existing row if phone already registered (duplicate detection). */
  async findByPhoneE164(phoneE164: string): Promise<DimActorRow | null> {
    const { data, error } = await supabase
      .from('dim_actors')
      .select('id, phone_e164, full_name, gender, date_of_birth, national_id, created_at, updated_at')
      .eq('phone_e164', phoneE164)
      .maybeSingle();
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') return null;
      return null;
    }
    return data;
  },

  /** Upsert farmer row for linkage and de-duplication. */
  async upsertFarmer(row: {
    phone_e164: string;
    full_name: string;
    gender?: string | null;
    date_of_birth?: string | null;
    national_id?: string | null;
  }): Promise<DimActorRow | null> {
    const { data, error } = await supabase
      .from('dim_actors')
      .upsert(
        {
          phone_e164: row.phone_e164,
          full_name: row.full_name,
          gender: row.gender ?? null,
          date_of_birth: row.date_of_birth ?? null,
          national_id: row.national_id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'phone_e164' },
      )
      .select()
      .single();
    if (error) {
      console.warn('[dim_actors upsert]', error.message);
      return null;
    }
    return data;
  },
};

// ---------------------------------------------------------------------------
// farm_entities — canonical farm profile from the wizard
// Requires migration `supabase/migrations/002_farm_entities.sql`
// ---------------------------------------------------------------------------

export interface FarmEntityRow {
  id: string;
  local_id: string;
  actor_id: string | null;
  legacy_farm_id: string | null;
  region_id: string | null;
  farm_name: string;
  farmer_name: string;
  farmer_phone: string | null;
  village: string | null;
  ward: string | null;
  district: string | null;
  region: string | null;
  total_area_ha: number;
  tenure_type: string | null;
  farming_system: string | null;
  contact_number: string | null;
  water_source: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type FarmEntityInsert = Omit<FarmEntityRow, 'id' | 'created_at' | 'updated_at'>;

export const farmEntities = {
  /** Look up by the client-generated temp ID (used by sync for idempotency). */
  async findByLocalId(localId: string): Promise<FarmEntityRow | null> {
    const { data, error } = await supabase
      .from('farm_entities')
      .select('*')
      .eq('local_id', localId)
      .maybeSingle();
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') return null;
      throw error;
    }
    return data;
  },

  /**
   * Offline-safe upsert keyed on `local_id`. Returning the row lets callers
   * resolve the server-side UUID and update child records (plots, boundary).
   */
  async upsertByLocalId(row: FarmEntityInsert): Promise<FarmEntityRow> {
    const { data, error } = await supabase
      .from('farm_entities')
      .upsert(
        { ...row, updated_at: new Date().toISOString() },
        { onConflict: 'local_id' },
      )
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async listByActor(actorId: string): Promise<FarmEntityRow[]> {
    const { data, error } = await supabase
      .from('farm_entities')
      .select('*')
      .eq('actor_id', actorId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};

// ---------------------------------------------------------------------------
// Realtime notifications
// ---------------------------------------------------------------------------

export function subscribeToNotifications(
  userId: string,
  onInsert: (payload: Record<string, unknown>) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `assigned_to=eq.${userId}`,
      },
      (payload) => {
        onInsert(payload.new as Record<string, unknown>);
      },
    )
    .subscribe();

  return channel;
}

export function unsubscribe(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}

// ---------------------------------------------------------------------------
// Reference data helpers
// ---------------------------------------------------------------------------

export const referenceData = {
  async getRegions(): Promise<RegionRow[]> {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getChildRegions(parentId: string): Promise<RegionRow[]> {
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('parent_id', parentId)
      .order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getCrops(): Promise<CropRow[]> {
    const { data, error } = await supabase
      .from('crops')
      .select('*')
      .order('name_en', { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getLocations(adminLevel?: number): Promise<DimLocationRow[]> {
    let query = supabase.from('dim_locations').select('*').order('name', { ascending: true });
    if (adminLevel !== undefined) {
      query = query.eq('admin_level', adminLevel);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getWeather(regionId: string, days = 7): Promise<WeatherObservationRow[]> {
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data, error } = await supabase
      .from('weather_observations')
      .select('*')
      .eq('region_id', regionId)
      .gte('observation_date', from.toISOString().split('T')[0])
      .order('observation_date', { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
};
