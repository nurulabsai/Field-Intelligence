/**
 * Supabase Client & Typed Query Helpers
 * NuruOS Field Intelligence
 */

import { createClient, type SupabaseClient, type RealtimeChannel } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase config: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables',
  );
}

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
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FarmRow {
  id: string;
  farmer_name: string;
  farmer_phone: string | null;
  region_id: string | null;
  village: string | null;
  total_area_ha: number | null;
  cultivated_area_ha: number | null;
  created_at: string;
}

export interface FarmAuditRow {
  id: string;
  campaign_id: string | null;
  farm_id: string;
  assigned_to: string | null;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  audit_location: unknown | null;
  gps_accuracy_m: number | null;
  started_at: string | null;
  completed_at: string | null;
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
  label: string | null;
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
  recorded_at: string;
}

export interface WeatherObservationRow {
  id: string;
  region_id: string;
  observation_date: string;
  rainfall_mm: number | null;
  temperature_max_c: number | null;
  temperature_min_c: number | null;
}

export interface ScheduleEventRow {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  assigned_to: string | null;
  event_type: string | null;
  status: string;
  created_at: string;
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
    updates: Partial<Pick<UserRow, 'full_name' | 'phone' | 'avatar_url'>>,
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
        .in('status', ['draft', 'in_progress']),
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
      .order('recorded_at', { ascending: false })
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
    const { data, error } = await supabase
      .from('farm_audits')
      .insert(audit)
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
      completed_at: new Date().toISOString(),
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
    return (data ?? []) as unknown as ScheduleEventRow[];
  },

  async createEvent(
    event: Omit<ScheduleEventRow, 'id' | 'created_at'>,
  ): Promise<ScheduleEventRow> {
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        entity_type: event.event_type ?? 'schedule',
        entity_id: '',
        title: event.title,
        assigned_to: event.assigned_to,
        due_date: event.start_time,
        status: event.status ?? 'pending',
      })
      .select()
      .single();
    if (error) throw error;
    return data as unknown as ScheduleEventRow;
  },

  async updateEvent(
    eventId: string,
    updates: Partial<ScheduleEventRow>,
  ): Promise<ScheduleEventRow> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title: updates.title,
        due_date: updates.start_time,
        status: updates.status,
      })
      .eq('id', eventId)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as ScheduleEventRow;
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
  capture_method: string;
  boundary_geojson: unknown;
  boundary_points: unknown[];
  status: string;
  confidence: string;
  gps_accuracy_summary: unknown;
  area_ha: number | null;
  captured_at: string | null;
  captured_by: string | null;
  notes: string | null;
  skip_reason: string | null;
  created_at: string;
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
  name: string;
  area_ha: number | null;
  status: string;
  current_crop: string | null;
  variety: string | null;
  growth_stage: string | null;
  irrigation_status: string | null;
  center_point: unknown | null;
  center_lat: number | null;
  center_lon: number | null;
  center_gps_accuracy: number | null;
  planting_season: string | null;
  notes: string | null;
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
