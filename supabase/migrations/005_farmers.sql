-- ============================================================
-- Migration: 005_farmers
-- Project: gyekncktmsvdtcbhakgl
-- Run this FIRST — farms (004) references this table
-- ============================================================

CREATE TABLE IF NOT EXISTS farmers (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number          TEXT NOT NULL,
  phone_normalized      TEXT GENERATED ALWAYS AS
                          (regexp_replace(phone_number, '\s', '', 'g')) STORED,
  full_name             TEXT NOT NULL,
  preferred_name        TEXT,
  national_id           TEXT,
  gender                TEXT NOT NULL CHECK (gender IN ('male','female','prefer_not_to_say')),
  age_range             TEXT NOT NULL,
  photo_url             TEXT,
  household_size        SMALLINT NOT NULL CHECK (household_size >= 1),
  dependents            SMALLINT NOT NULL CHECK (dependents >= 0),
  off_farm_income       BOOLEAN NOT NULL,
  off_farm_income_source TEXT,
  primary_income_source TEXT NOT NULL,
  education_level       TEXT NOT NULL,
  years_farming         TEXT NOT NULL,
  has_received_training BOOLEAN NOT NULL,
  training_types        TEXT[],
  cooperative_member    BOOLEAN NOT NULL,
  cooperative_name      TEXT,
  farmer_group_member   BOOLEAN,
  farmer_group_name     TEXT,
  extension_contact_freq TEXT NOT NULL,
  has_bank_account      BOOLEAN NOT NULL,
  bank_name             TEXT,
  mobile_money_user     BOOLEAN NOT NULL,
  mobile_money_providers TEXT[],
  mobile_money_number   TEXT,
  has_accessed_credit   BOOLEAN NOT NULL,
  credit_sources        TEXT[],
  credit_purpose        TEXT,
  has_input_credit      BOOLEAN NOT NULL,
  input_credit_source   TEXT,
  phone_type            TEXT NOT NULL
    CHECK (phone_type IN ('smartphone','feature_phone','no_phone')),
  uses_whatsapp         BOOLEAN NOT NULL,
  uses_agri_apps        BOOLEAN,
  agri_apps_used        TEXT[],
  language_preference   TEXT NOT NULL,
  comfort_digital_forms TEXT NOT NULL,
  is_duplicate          BOOLEAN DEFAULT FALSE,
  merged_into_id        UUID REFERENCES farmers(id),
  first_captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  first_captured_by     UUID NOT NULL,
  last_updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated_by       UUID,
  source_audit_id       UUID,
  audit_count           INTEGER DEFAULT 1
);

CREATE INDEX idx_farmers_phone      ON farmers(phone_normalized);
CREATE INDEX idx_farmers_name       ON farmers(full_name);
CREATE INDEX idx_farmers_capturer   ON farmers(first_captured_by);
CREATE INDEX idx_farmers_coop       ON farmers(cooperative_member);
CREATE INDEX idx_farmers_mobile     ON farmers(mobile_money_user);

CREATE TABLE IF NOT EXISTS farmer_audit_appearances (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id   UUID NOT NULL REFERENCES farmers(id) ON DELETE CASCADE,
  audit_id    UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  farm_id     UUID,
  appeared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (farmer_id, audit_id)
);

CREATE INDEX idx_appearances_farmer ON farmer_audit_appearances(farmer_id);
CREATE INDEX idx_appearances_audit  ON farmer_audit_appearances(audit_id);

CREATE TABLE IF NOT EXISTS farmer_duplicate_candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id_a   UUID NOT NULL REFERENCES farmers(id),
  farmer_id_b   UUID NOT NULL REFERENCES farmers(id),
  match_reason  TEXT NOT NULL,
  confidence    SMALLINT CHECK (confidence BETWEEN 0 AND 100),
  status        TEXT DEFAULT 'pending'
                  CHECK (status IN ('pending','confirmed','rejected','merged')),
  reviewed_by   UUID,
  reviewed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (farmer_id_a, farmer_id_b)
);

ALTER TABLE farmers                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_audit_appearances   ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_duplicate_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_farmers"
  ON farmers FOR SELECT USING (TRUE);

CREATE POLICY "insert_own_farmers"
  ON farmers FOR INSERT
  WITH CHECK (first_captured_by = auth.uid());

CREATE POLICY "update_own_farmers"
  ON farmers FOR UPDATE
  USING (first_captured_by = auth.uid());

CREATE POLICY "own_appearances"
  ON farmer_audit_appearances FOR ALL
  USING (audit_id IN (SELECT id FROM audits WHERE auditor_id = auth.uid()));

CREATE OR REPLACE FUNCTION fn_update_farmer_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = NOW();
  NEW.last_updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_farmers_updated_at
  BEFORE UPDATE ON farmers
  FOR EACH ROW EXECUTE FUNCTION fn_update_farmer_updated_at();

CREATE OR REPLACE VIEW v_farmer_intelligence AS
SELECT
  f.id, f.full_name, f.phone_normalized, f.gender, f.age_range,
  f.cooperative_member, f.mobile_money_user, f.mobile_money_providers,
  f.has_bank_account, f.has_accessed_credit,
  f.phone_type, f.uses_whatsapp, f.language_preference,
  f.audit_count, f.is_duplicate, f.first_captured_at,
  COUNT(DISTINCT fm.id)   AS farm_count,
  SUM(fm.total_area_ha)   AS total_farm_area_ha
FROM farmers f
LEFT JOIN farms fm ON fm.farmer_id = f.id
GROUP BY f.id;

GRANT SELECT ON v_farmer_intelligence TO authenticated;
