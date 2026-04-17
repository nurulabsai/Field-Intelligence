-- ---------------------------------------------------------------------------
-- 002_farm_entities.sql
-- Canonical farm entity table — captures the full FarmProfile emitted by the
-- extended audit wizard (Farm → FarmBoundary → Plot[] → PlotObservation[]).
--
-- Why a new table instead of extending `farms`:
--   * `farms` is a minimal legacy FK target for `farm_audits.farm_id` and is
--     referenced by existing production data.
--   * The wizard emits a richer profile (village/ward/district/region, tenure,
--     farming_system, water_source, etc.) that does not fit the legacy shape.
--   * `local_id` is the client-generated temp ID used for offline-safe
--     idempotent upserts. Keeps the legacy `farms` table untouched while the
--     sync service is migrated.
--
-- Contract source: `AuditSubmissionPayload.farm` in src/lib/audit-types.ts
-- Run via Supabase CLI (`supabase db push`) or paste into SQL editor.
-- ---------------------------------------------------------------------------

create table if not exists public.farm_entities (
  id              uuid primary key default gen_random_uuid(),

  -- Offline idempotency: client-generated temp ID (e.g. `tmp_<ts>_<rand>`).
  -- Used by the sync service to avoid duplicate inserts on retry.
  local_id        text not null unique,

  -- Optional links to existing entities. Kept nullable so the wizard can
  -- persist a farm profile before the farmer is resolved in dim_actors or
  -- before the legacy `farms` row is backfilled.
  actor_id        uuid references public.dim_actors(id) on delete set null,
  legacy_farm_id  uuid references public.farms(id)      on delete set null,
  region_id       uuid references public.regions(id)    on delete set null,

  -- Core profile (mirrors FarmProfile in audit-types.ts)
  farm_name       text not null,
  farmer_name     text not null,
  farmer_phone    text,
  village         text,
  ward            text,
  district        text,
  region          text,
  total_area_ha   numeric(10, 2) not null check (total_area_ha >= 0),

  tenure_type     text check (
    tenure_type is null or tenure_type in
      ('owned', 'leased', 'communal', 'government', 'borrowed', 'other')
  ),
  farming_system  text check (
    farming_system is null or farming_system in
      ('rainfed', 'irrigated', 'mixed')
  ),

  contact_number  text,
  water_source    text,
  notes           text,

  -- Provenance
  created_by      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists farm_entities_actor_id_idx
  on public.farm_entities (actor_id);

create index if not exists farm_entities_legacy_farm_id_idx
  on public.farm_entities (legacy_farm_id);

create index if not exists farm_entities_region_id_idx
  on public.farm_entities (region_id);

-- Admin-cascade lookups (dashboards / reporting by district+region)
create index if not exists farm_entities_admin_cascade_idx
  on public.farm_entities (region, district, ward);

-- Phone lookup for duplicate detection when actor_id is not yet resolved
create index if not exists farm_entities_farmer_phone_idx
  on public.farm_entities (farmer_phone);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists farm_entities_set_updated_at on public.farm_entities;
create trigger farm_entities_set_updated_at
  before update on public.farm_entities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.farm_entities enable row level security;

-- Authenticated users can read all farm entities (field teams share farm
-- profiles across audits — mirrors dim_actors policy in 001).
drop policy if exists "farm_entities_select_auth" on public.farm_entities;
create policy "farm_entities_select_auth"
  on public.farm_entities for select
  to authenticated
  using (true);

-- Authenticated users can insert; created_by is stamped from auth.uid()
-- when the application doesn't provide it explicitly.
drop policy if exists "farm_entities_insert_auth" on public.farm_entities;
create policy "farm_entities_insert_auth"
  on public.farm_entities for insert
  to authenticated
  with check (
    created_by is null or created_by = auth.uid()
  );

-- Update allowed to any authenticated user. Tighten to creator-only or
-- organization-scoped once the users/organization model lands.
drop policy if exists "farm_entities_update_auth" on public.farm_entities;
create policy "farm_entities_update_auth"
  on public.farm_entities for update
  to authenticated
  using (true)
  with check (true);

-- No delete policy: farm entities are append-only from the client. Admin
-- cleanup should go through service_role.

comment on table  public.farm_entities is 'Canonical farm profile captured by the field audit wizard. One row per physical farm; upserted by local_id for offline idempotency.';
comment on column public.farm_entities.local_id is 'Client-generated temp ID used for offline-safe idempotent upserts during sync.';
comment on column public.farm_entities.legacy_farm_id is 'Optional link back to public.farms for backward compatibility with farm_audits.farm_id.';
