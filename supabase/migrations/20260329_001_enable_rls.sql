-- ============================================================
-- NuruOS Field Intelligence — Row Level Security Policies
-- Ensures every table enforces access control via Supabase Auth.
-- Run once against the production database.
-- ============================================================

-- ── Enable RLS on all application tables ─────────────────────

ALTER TABLE IF EXISTS users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS farms           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS farm_audits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_findings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_photos    ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS schedule_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crops           ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS regions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS market_prices   ENABLE ROW LEVEL SECURITY;

-- ── Helper: current user's internal ID from auth.uid() ───────
-- Assumes users.auth_id = auth.uid()

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

-- ── users ────────────────────────────────────────────────────

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (auth_id = auth.uid())
  WITH CHECK (auth_id = auth.uid());

-- ── farms ────────────────────────────────────────────────────

-- Authenticated users can read all farms (auditors need cross-farm visibility)
CREATE POLICY "farms_select_authenticated"
  ON farms FOR SELECT
  TO authenticated
  USING (true);

-- Only the creator or admins can insert farms
CREATE POLICY "farms_insert_authenticated"
  ON farms FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ── farm_audits ──────────────────────────────────────────────

-- Auditors see audits assigned to them; admins see all
CREATE POLICY "farm_audits_select"
  ON farm_audits FOR SELECT
  TO authenticated
  USING (
    assigned_to = public.current_user_id()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- Auditors can create audits
CREATE POLICY "farm_audits_insert"
  ON farm_audits FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Auditors can update their own audits; admins can update any
CREATE POLICY "farm_audits_update"
  ON farm_audits FOR UPDATE
  TO authenticated
  USING (
    assigned_to = public.current_user_id()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ── audit_findings ───────────────────────────────────────────

-- Visible if the parent audit is visible
CREATE POLICY "audit_findings_select"
  ON audit_findings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farm_audits
      WHERE farm_audits.id = audit_findings.audit_id
    )
  );

CREATE POLICY "audit_findings_insert"
  ON audit_findings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farm_audits
      WHERE farm_audits.id = audit_findings.audit_id
    )
  );

-- ── audit_photos ─────────────────────────────────────────────

CREATE POLICY "audit_photos_select"
  ON audit_photos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM farm_audits
      WHERE farm_audits.id = audit_photos.audit_id
    )
  );

CREATE POLICY "audit_photos_insert"
  ON audit_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM farm_audits
      WHERE farm_audits.id = audit_photos.audit_id
    )
  );

-- ── schedule_events ──────────────────────────────────────────

-- Users see their own events; admins see all
CREATE POLICY "schedule_events_select"
  ON schedule_events FOR SELECT
  TO authenticated
  USING (
    assigned_to = public.current_user_id()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "schedule_events_insert"
  ON schedule_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "schedule_events_update"
  ON schedule_events FOR UPDATE
  TO authenticated
  USING (
    assigned_to = public.current_user_id()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

CREATE POLICY "schedule_events_delete"
  ON schedule_events FOR DELETE
  TO authenticated
  USING (
    assigned_to = public.current_user_id()::text
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- ── Reference data (read-only for all authenticated users) ───

CREATE POLICY "crops_select_all"
  ON crops FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "regions_select_all"
  ON regions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "market_prices_select_all"
  ON market_prices FOR SELECT
  TO authenticated
  USING (true);

-- ── Storage bucket policies (for audit photos in R2/Supabase Storage) ───
-- If using Supabase Storage instead of R2, uncomment:
-- CREATE POLICY "audit_photos_storage_select"
--   ON storage.objects FOR SELECT
--   TO authenticated
--   USING (bucket_id = 'audit-photos');
--
-- CREATE POLICY "audit_photos_storage_insert"
--   ON storage.objects FOR INSERT
--   TO authenticated
--   WITH CHECK (bucket_id = 'audit-photos');
