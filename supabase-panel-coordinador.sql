-- Panel del coordinador: control de aperturas/cierres por celebración

-- Vista para tablero (incluye slots activos e inactivos)
create or replace view public.v_panel_coordinador as
select
  s.id as slot_id,
  s.ministry_key,
  s.label,
  s.capacity,
  s.is_active,
  count(r.id)::int as registered,
  greatest(s.capacity - count(r.id), 0)::int as available,
  (count(r.id) >= s.capacity) as is_full
from public.mec_slots s
left join public.mec_registrations r on r.slot_id = s.id
group by s.id, s.ministry_key, s.label, s.capacity, s.is_active;

-- RLS de lectura: anónimos solo ven activos; usuarios autenticados ven todo
alter table public.mec_slots enable row level security;

drop policy if exists mec_slots_read on public.mec_slots;
drop policy if exists mec_slots_read_anon on public.mec_slots;
drop policy if exists mec_slots_read_auth on public.mec_slots;

create policy mec_slots_read_anon
  on public.mec_slots
  for select
  to anon
  using (is_active = true);

create policy mec_slots_read_auth
  on public.mec_slots
  for select
  to authenticated
  using (true);

-- Permiso de cierre/reapertura desde panel (solo usuarios autenticados)
drop policy if exists mec_slots_update_auth on public.mec_slots;
create policy mec_slots_update_auth
  on public.mec_slots
  for update
  to authenticated
  using (true)
  with check (true);
