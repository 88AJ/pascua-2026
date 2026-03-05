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
