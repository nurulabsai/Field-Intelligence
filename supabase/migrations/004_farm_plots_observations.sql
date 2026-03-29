-- ============================================================
-- Migration: 004_farm_plots_observations
-- Project: gyekncktmsvdtcbhakgl
-- Run AFTER 005_farmers
-- ============================================================

CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS farms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id       UUID REFERENCES farmers(id) ON DELETE SET NULL,
  audit_id        UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  local_ref       TEXT NOT NULL,
  farmer_name     TEXT NOT NULL,
  farmer_contact  TEXT,
  region          TEXT NOT NULL,
  district        TEXT NOT NULL,
  ward            TEXT NOT NULL,
  village         TEXT NOT NULL,
  total_area_ha   NUMERIC(10,4) NOT NULL CHECK (total_area_ha > 0),
  tenure_type     TEXT NOT NULL,
  farming_system  TEXT NOT NULL,
  water_source    TEXT,
  notes           TEXT,
  captured_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by     UUID NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_farms_farmer_id  ON farms(farmer_id);
CREATE INDEX idx_farms_audit_id   ON farms(audit_id);
CREATE INDEX idx_farms_region     ON farms(region);
CREATE INDEX idx_farms_district   ON farms(district);
CREATE INDEX idx_farms_capturer   ON farms(captured_by);

CREATE TABLE IF NOT EXISTS farm_boundaries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id          UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  method            TEXT NOT NULL CHECK (method IN ('walk','corner_points','quick_draft')),
  status            TEXT NOT NULL CHECK (status IN ('draft','complete','skipped')),
  boundary_geom     GEOMETRY(Polygon, 4326),
  point_count       INTEGER,
  area_ha           NUMERIC(10,4),
  gps_accuracy_min  NUMERIC(8,2),
  gps_accuracy_max  NUMERIC(8,2),
  gps_accuracy_avg  NUMERIC(8,2),
  confidence_score  SMALLINT CHECK (confidence_score BETWEEN 0 AND 100),
  skip_reason       TEXT,
  notes             TEXT,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by       UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_boundaries_farm   ON farm_boundaries(farm_id);
CREATE INDEX idx_boundaries_geom   ON farm_boundaries USING GIST(boundary_geom);

CREATE TABLE IF NOT EXISTS plots (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id          UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  local_id          TEXT NOT NULL,
  plot_name         TEXT NOT NULL,
  area_ha           NUMERIC(10,4) NOT NULL CHECK (area_ha > 0),
  status            TEXT NOT NULL
    CHECK (status IN ('active','fallow','prepared','abandoned')),
  current_crop      TEXT NOT NULL,
  variety           TEXT,
  growth_stage      TEXT NOT NULL,
  irrigation_status TEXT NOT NULL,
  planting_month    TEXT,
  center_point      GEOMETRY(Point, 4326),
  center_accuracy_m NUMERIC(8,2),
  photo_url         TEXT,
  notes             TEXT,
  captured_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by       UUID NOT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (audit_id, local_id)
);

CREATE INDEX idx_plots_farm        ON plots(farm_id);
CREATE INDEX idx_plots_audit       ON plots(audit_id);
CREATE INDEX idx_plots_crop        ON plots(current_crop);
CREATE INDEX idx_plots_center      ON plots USING GIST(center_point);

CREATE TABLE IF NOT EXISTS plot_observations (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id                  UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
  farm_id                  UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  audit_id                 UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  crop_condition           TEXT NOT NULL
    CHECK (crop_condition IN ('excellent','good','fair','poor','failed')),
  pest_present             BOOLEAN NOT NULL,
  disease_present          BOOLEAN NOT NULL,
  pest_type                TEXT,
  pest_severity            TEXT CHECK (pest_severity IN ('mild','moderate','severe')),
  disease_type             TEXT,
  disease_severity         TEXT CHECK (disease_severity IN ('mild','moderate','severe')),
  visible_stress_level     TEXT CHECK (visible_stress_level IN ('none','mild','moderate','severe')),
  soil_moisture_impression TEXT CHECK (soil_moisture_impression IN ('dry','adequate','waterlogged')),
  weed_pressure            TEXT CHECK (weed_pressure IN ('none','low','moderate','high')),
  plant_vigor              TEXT CHECK (plant_vigor IN ('strong','moderate','weak')),
  yield_outlook            TEXT CHECK (yield_outlook IN
    ('above_average','average','below_average','crop_failure')),
  photo_url                TEXT,
  voice_note_url           TEXT,
  ai_analysis_summary      TEXT,
  notes                    TEXT,
  captured_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  captured_by              UUID NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plot_obs_plot    ON plot_observations(plot_id);
CREATE INDEX idx_plot_obs_farm    ON plot_observations(farm_id);
CREATE INDEX idx_plot_obs_audit   ON plot_observations(audit_id);
CREATE INDEX idx_plot_obs_cond    ON plot_observations(crop_condition);
CREATE INDEX idx_plot_obs_pest    ON plot_observations(pest_present);
CREATE INDEX idx_plot_obs_disease ON plot_observations(disease_present);

CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_farms_updated_at
  BEFORE UPDATE ON farms FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_boundaries_updated_at
  BEFORE UPDATE ON farm_boundaries FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_plots_updated_at
  BEFORE UPDATE ON plots FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE TRIGGER trg_plot_obs_updated_at
  BEFORE UPDATE ON plot_observations FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

ALTER TABLE farms             ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_boundaries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE plots             ENABLE ROW LEVEL SECURITY;
ALTER TABLE plot_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_farms"       ON farms FOR ALL USING (captured_by = auth.uid());
CREATE POLICY "own_boundaries"  ON farm_boundaries FOR ALL USING (captured_by = auth.uid());
CREATE POLICY "own_plots"       ON plots FOR ALL USING (captured_by = auth.uid());
CREATE POLICY "own_plot_obs"    ON plot_observations FOR ALL USING (captured_by = auth.uid());
