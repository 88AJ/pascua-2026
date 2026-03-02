-- Supabase setup for MEC Ramos registration
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

create table if not exists public.mec_slots (
  id text primary key,
  ministry_key text not null,
  label text not null,
  capacity integer not null check (capacity > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.mec_registrations (
  id uuid primary key default gen_random_uuid(),
  ministry_key text not null,
  slot_id text not null references public.mec_slots(id) on update cascade on delete restrict,
  full_name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists mec_registrations_unique_slot_phone
  on public.mec_registrations(slot_id, phone);

-- Seed slots for all MEC pages
insert into public.mec_slots (id, ministry_key, label, capacity)
values
  ('mec-ramos-parroquia-sab-1800', 'mec-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 3),
  ('mec-ramos-parroquia-dom-0800', 'mec-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 3),
  ('mec-ramos-parroquia-dom-1000', 'mec-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 3),
  ('mec-ramos-parroquia-dom-1200', 'mec-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 3),
  ('mec-ramos-parroquia-dom-1800', 'mec-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 3),
  ('mec-ramos-capilla-dom-1100', 'mec-ramos', 'Capilla San Judas - Domingo 11:00 AM', 2),
  ('mec-lunes-parroquia-0800', 'mec-lunes', 'Parroquia San Pedro - 8:00 AM', 2),
  ('mec-lunes-parroquia-1800', 'mec-lunes', 'Parroquia San Pedro - 6:00 PM', 2),
  ('mec-martes-parroquia-0800', 'mec-martes', 'Parroquia San Pedro - 8:00 AM', 2),
  ('mec-martes-parroquia-1800', 'mec-martes', 'Parroquia San Pedro - 6:00 PM', 2),
  ('mec-miercoles-parroquia-1800', 'mec-miercoles', 'Parroquia San Pedro - 6:00 PM', 2),
  ('mec-jueves-parroquia-1800', 'mec-jueves', 'Parroquia San Pedro - 6:00 PM', 6),
  ('mec-jueves-capilla-1800', 'mec-jueves', 'Capilla San Judas - 6:00 PM', 3),
  ('mec-viernes-parroquia-1700', 'mec-viernes', 'Parroquia San Pedro - 5:00 PM', 2),
  ('mec-viernes-capilla-1730', 'mec-viernes', 'Capilla San Judas - 5:30 PM', 2),
  ('mec-vigilia-parroquia-1900', 'mec-vigilia', 'Parroquia San Pedro - 7:00 PM', 8),
  ('mec-vigilia-capilla-1900', 'mec-vigilia', 'Capilla San Judas - 7:00 PM', 5)
on conflict (id) do update
set
  ministry_key = excluded.ministry_key,
  label = excluded.label,
  capacity = excluded.capacity,
  is_active = true;

alter table public.mec_slots enable row level security;
alter table public.mec_registrations enable row level security;

drop policy if exists mec_slots_read on public.mec_slots;
create policy mec_slots_read
  on public.mec_slots
  for select
  to anon, authenticated
  using (is_active = true);

drop policy if exists mec_registrations_read on public.mec_registrations;
create policy mec_registrations_read
  on public.mec_registrations
  for select
  to anon, authenticated
  using (true);

drop policy if exists mec_registrations_insert on public.mec_registrations;
create policy mec_registrations_insert
  on public.mec_registrations
  for insert
  to anon, authenticated
  with check (true);

-- Reporting view: occupancy by slot (ready for dashboard/export)
create or replace view public.v_mec_slot_occupancy as
select
  s.id as slot_id,
  s.ministry_key,
  s.label,
  s.capacity,
  count(r.id)::int as registered,
  greatest(s.capacity - count(r.id), 0)::int as available,
  (count(r.id) >= s.capacity) as is_full
from public.mec_slots s
left join public.mec_registrations r on r.slot_id = s.id
where s.is_active = true
group by s.id, s.ministry_key, s.label, s.capacity;

-- Reporting view: registration roster by slot (for attendance sheets)
create or replace view public.v_mec_registration_roster as
select
  r.id as registration_id,
  r.created_at,
  r.ministry_key,
  s.id as slot_id,
  s.label as slot_label,
  r.full_name,
  r.phone,
  ''::text as asistencia,
  coalesce(r.notes, '') as notes
from public.mec_registrations r
join public.mec_slots s on s.id = r.slot_id
where s.is_active = true;
