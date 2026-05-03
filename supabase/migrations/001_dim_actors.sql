-- Farmer / enumerator identity dimension — separate from farm_audits for multi-farm linkage.
-- Run in Supabase SQL editor or via CLI after linking the project.

create table if not exists public.dim_actors (
  id uuid primary key default gen_random_uuid(),
  phone_e164 text not null unique,
  full_name text,
  gender text,
  date_of_birth date,
  national_id text,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists dim_actors_phone_e164_idx on public.dim_actors (phone_e164);

alter table public.dim_actors enable row level security;

create policy "dim_actors_select_auth"
  on public.dim_actors for select
  to authenticated
  using (created_by = auth.uid());

create policy "dim_actors_insert_auth"
  on public.dim_actors for insert
  to authenticated
  with check (created_by is null or created_by = auth.uid());

create policy "dim_actors_update_auth"
  on public.dim_actors for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

comment on table public.dim_actors is 'OR-TAMISEMI farmer / actor registry; one row per unique phone.';
