-- Seguridad para panel-coordinador (Supabase)
-- Ejecutar en SQL Editor.
-- Reemplaza TU_CORREO_ADMIN@dominio.com por tu correo real.

-- 1) Función helper: valida si el usuario autenticado es admin.
create or replace function public.is_panel_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') = any (
      array[
        lower('TU_CORREO_ADMIN@dominio.com')
      ]
    ),
    false
  );
$$;

-- 2) Asegura RLS en tablas base.
alter table if exists public.mec_slots enable row level security;
alter table if exists public.mec_registrations enable row level security;

-- 3) Políticas para mec_slots.
drop policy if exists mec_slots_select_admin on public.mec_slots;
create policy mec_slots_select_admin
on public.mec_slots
for select
to authenticated
using (public.is_panel_admin());

drop policy if exists mec_slots_update_admin on public.mec_slots;
create policy mec_slots_update_admin
on public.mec_slots
for update
to authenticated
using (public.is_panel_admin())
with check (public.is_panel_admin());

-- 4) Políticas para mec_registrations.
-- Mantiene insert público para registros de voluntarios,
-- pero restringe lectura al panel solo para admin.
drop policy if exists mec_registrations_insert_public on public.mec_registrations;
create policy mec_registrations_insert_public
on public.mec_registrations
for insert
to anon, authenticated
with check (true);

drop policy if exists mec_registrations_select_admin on public.mec_registrations;
create policy mec_registrations_select_admin
on public.mec_registrations
for select
to authenticated
using (public.is_panel_admin());

drop policy if exists mec_registrations_delete_admin on public.mec_registrations;
create policy mec_registrations_delete_admin
on public.mec_registrations
for delete
to authenticated
using (public.is_panel_admin());

-- 5) Si la vista v_panel_coordinador se apoya en esas tablas,
-- quedará protegida por estas políticas al consultar desde el cliente.

-- 6) Slots para "Voluntario general" (registro público por día).
-- Ejecuta este bloque una sola vez (o cuando quieras actualizar capacidades).
insert into public.mec_slots (id, ministry_key, label, capacity)
values
  ('voluntario-ramos-general', 'voluntario-ramos', 'Voluntario General - Domingo de Ramos', 30),
  ('voluntario-lunes-general', 'voluntario-lunes', 'Voluntario General - Lunes Santo', 30),
  ('voluntario-martes-general', 'voluntario-martes', 'Voluntario General - Martes Santo', 30),
  ('voluntario-miercoles-general', 'voluntario-miercoles', 'Voluntario General - Miércoles Santo', 30),
  ('voluntario-jueves-general', 'voluntario-jueves', 'Voluntario General - Jueves Santo', 30),
  ('voluntario-viernes-general', 'voluntario-viernes', 'Voluntario General - Viernes Santo', 30),
  ('voluntario-vigilia-general', 'voluntario-vigilia', 'Voluntario General - Vigilia Pascual', 30)
on conflict (id) do update
set
  ministry_key = excluded.ministry_key,
  label = excluded.label,
  capacity = excluded.capacity,
  is_active = true;

-- 7) Evitar reemplazo de registros:
-- Permite que una misma persona se registre en varias celebraciones
-- y bloquea solo duplicados en la MISMA celebración.
drop index if exists public.mec_registrations_phone_key;
drop index if exists public.mec_registrations_unique_phone;
drop index if exists public.mec_registrations_unique_ministry_phone;
create unique index if not exists mec_registrations_unique_slot_phone
  on public.mec_registrations (slot_id, phone);
