-- ---------------------------------------------------------------------------
-- 003_audit_consent_and_plot_gps.sql
-- Applied via Supabase MCP migration "003_audit_consent_and_plot_gps".
--
-- Adds:
--   1. audit_consent_records  - structured, signature-bearing consent rows
--      that serve both farm audits (subject_farmer_id) and business audits
--      (subject_actor_id -> dim_actors.id). Replaces the binary farmers.consent_data flag with
--      a full audit trail (granular flags, signature blob, witness, GPS,
--      timestamps, withdrawal-rights confirmation, language).
--   2. plot GPS / agronomic columns on public.plots (centroid + accuracy,
--      capture method, soil/slope/irrigation/tenure, area-source decision,
--      offline sync metadata).
--   3. RLS policies mirroring the existing farm_audits pattern.
-- ---------------------------------------------------------------------------

-- --- 1. audit_consent_records ----------------------------------------------

create table if not exists public.audit_consent_records (
  id                                  uuid primary key default gen_random_uuid(),

  -- Offline idempotency: client-generated UUID; sync upserts on this column.
  client_id                           uuid not null unique,

  -- Polymorphic subject. Exactly one must be set.
  subject_farmer_id                   uuid references public.farmers(id)    on delete cascade,
  subject_actor_id                    uuid references public.dim_actors(id) on delete cascade,

  -- Optional link to the audit that triggered this consent capture.
  farm_audit_id                       uuid references public.farm_audits(id) on delete set null,
  audit_type                          text not null check (audit_type in ('farm_audit','business_audit')),

  -- Identity confirmation captured during consent
  subject_name_confirmed              text not null,
  subject_id_confirmed                text,

  -- Granular consent flags
  consent_data_collection             boolean not null default false,
  consent_data_sharing_ortamisemi     boolean not null default false,
  consent_data_sharing_government     boolean not null default false,
  consent_photo_capture               boolean not null default false,
  consent_gps_location                boolean not null default false,

  -- Informed consent metadata
  language_of_consent                 text not null default 'sw' check (language_of_consent in ('sw','en')),
  consent_read_aloud                  boolean not null default false,
  subject_literate                    boolean,
  right_to_withdraw_explained         boolean not null default false,

  -- Signature / thumbprint / verbal witness
  consent_method                      text not null check (consent_method in ('signature','thumbprint','verbal_witnessed')),
  consent_signature_data              text,
  consent_signature_storage_path      text,
  witness_name                        text,
  witness_phone                       text,

  -- Spatial / temporal provenance at moment of consent
  consent_given_at                    timestamptz not null default now(),
  consent_location                    geography(point, 4326),
  consent_location_lat                numeric(10, 8),
  consent_location_lng                numeric(11, 8),

  -- Form versioning so consent text changes are auditable
  form_version                        text not null default 'v1',

  -- Provenance
  captured_by                         uuid references auth.users(id) on delete set null default auth.uid(),
  device_id                           text,
  created_at                          timestamptz not null default now(),
  updated_at                          timestamptz not null default now(),

  constraint audit_consent_subject_xor check (
    (subject_farmer_id is not null)::int + (subject_actor_id is not null)::int = 1
  ),

  constraint audit_consent_witness_required check (
    consent_method <> 'verbal_witnessed'
    or (witness_name is not null and length(trim(witness_name)) > 0)
  )
);

create index if not exists audit_consent_subject_farmer_idx on public.audit_consent_records (subject_farmer_id);
create index if not exists audit_consent_subject_actor_idx  on public.audit_consent_records (subject_actor_id);
create index if not exists audit_consent_farm_audit_idx     on public.audit_consent_records (farm_audit_id);
create index if not exists audit_consent_given_at_idx       on public.audit_consent_records (consent_given_at desc);
create index if not exists audit_consent_location_gix       on public.audit_consent_records using gist (consent_location);

create or replace function public.audit_consent_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists audit_consent_set_updated_at on public.audit_consent_records;
create trigger audit_consent_set_updated_at
  before update on public.audit_consent_records
  for each row execute function public.audit_consent_set_updated_at();

alter table public.audit_consent_records enable row level security;

drop policy if exists "audit_consent_select_auth" on public.audit_consent_records;
create policy "audit_consent_select_auth"
  on public.audit_consent_records for select
  to authenticated using (captured_by = auth.uid());

drop policy if exists "audit_consent_insert_auth" on public.audit_consent_records;
create policy "audit_consent_insert_auth"
  on public.audit_consent_records for insert
  to authenticated with check (captured_by is null or captured_by = auth.uid());

drop policy if exists "audit_consent_update_own" on public.audit_consent_records;
create policy "audit_consent_update_own"
  on public.audit_consent_records for update
  to authenticated
  using (captured_by = auth.uid())
  with check (captured_by = auth.uid());

comment on table public.audit_consent_records is 'Structured OR-TAMISEMI-compliant consent records for farm and business audits.';

-- --- 2. plots: GPS + agronomic + offline columns ---------------------------

alter table public.plots
  add column if not exists client_id                     uuid,
  add column if not exists gps_capture_method            text check (
        gps_capture_method is null
        or gps_capture_method in ('centroid','boundary_walk','satellite_pin','corner','quick')
      ),
  add column if not exists centroid                      geography(point, 4326),
  add column if not exists centroid_lat                  numeric(10, 8),
  add column if not exists centroid_lng                  numeric(11, 8),
  add column if not exists centroid_accuracy_m           numeric(8, 2),
  add column if not exists centroid_altitude_m           numeric(8, 2),
  add column if not exists centroid_captured_at          timestamptz,
  add column if not exists boundary_geojson              jsonb,
  add column if not exists boundary_area_calculated_ha   numeric(10, 4),
  add column if not exists area_farmer_estimate_acres    numeric(10, 4),
  add column if not exists area_measured_ha              numeric(10, 4),
  add column if not exists area_satellite_ha             numeric(10, 4),
  add column if not exists area_used_for_reporting       text check (
        area_used_for_reporting is null
        or area_used_for_reporting in ('farmer_estimate','gps_measured','satellite')
      ),
  add column if not exists soil_type                     text check (
        soil_type is null or soil_type in ('clay','sandy','loam','silt','mixed')
      ),
  add column if not exists slope                         text check (
        slope is null or slope in ('flat','gentle','moderate','steep')
      ),
  add column if not exists irrigation_access             boolean default false,
  add column if not exists irrigation_type               text check (
        irrigation_type is null
        or irrigation_type in ('drip','sprinkler','flood','canal','rain_fed','none')
      ),
  add column if not exists land_tenure_type              text check (
        land_tenure_type is null
        or land_tenure_type in ('owned','leased','communal','government','borrowed','other')
      ),
  add column if not exists plot_status                   text check (
        plot_status is null or plot_status in ('active','fallow','prepared','abandoned')
      ),
  add column if not exists current_variety               text,
  add column if not exists planting_season               text,
  add column if not exists notes                         text,
  add column if not exists created_offline               boolean default false,
  add column if not exists last_synced_at                timestamptz,
  add column if not exists captured_by                   uuid references auth.users(id) on delete set null;

create unique index if not exists plots_client_id_uidx
  on public.plots (client_id) where client_id is not null;

create index if not exists plots_centroid_gix      on public.plots using gist (centroid);
create index if not exists plots_last_synced_at_idx on public.plots (last_synced_at);

-- --- 3. consent helper view -------------------------------------------------

create or replace view public.v_audit_consent_current as
select distinct on (coalesce(subject_farmer_id::text, subject_actor_id::text))
  coalesce(subject_farmer_id::text, subject_actor_id::text) as subject_key,
  subject_farmer_id, subject_actor_id, audit_type,
  consent_data_collection, consent_data_sharing_ortamisemi, consent_data_sharing_government,
  consent_photo_capture, consent_gps_location,
  consent_method, language_of_consent, consent_given_at, form_version
from public.audit_consent_records
order by coalesce(subject_farmer_id::text, subject_actor_id::text), consent_given_at desc;
