-- Seed slots for Monaguillos registration pages
-- Run in Supabase SQL Editor after base tables/policies are created.

insert into public.mec_slots (id, ministry_key, label, capacity)
values
  ('monaguillos-ramos-parroquia-sab-1800', 'monaguillos-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 4),
  ('monaguillos-ramos-parroquia-dom-0800', 'monaguillos-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 4),
  ('monaguillos-ramos-parroquia-dom-1000', 'monaguillos-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 4),
  ('monaguillos-ramos-parroquia-dom-1200', 'monaguillos-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 4),
  ('monaguillos-ramos-parroquia-dom-1800', 'monaguillos-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 4),
  ('monaguillos-ramos-capilla-dom-1100', 'monaguillos-ramos', 'Capilla San Judas - Domingo 11:00 AM', 4),
  ('monaguillos-lunes-parroquia-0800', 'monaguillos-lunes', 'Parroquia San Pedro - 8:00 AM', 2),
  ('monaguillos-lunes-parroquia-1800', 'monaguillos-lunes', 'Parroquia San Pedro - 6:00 PM', 2),
  ('monaguillos-martes-parroquia-0800', 'monaguillos-martes', 'Parroquia San Pedro - 8:00 AM', 2),
  ('monaguillos-martes-parroquia-1800', 'monaguillos-martes', 'Parroquia San Pedro - 6:00 PM', 2),
  ('monaguillos-miercoles-parroquia-1800', 'monaguillos-miercoles', 'Parroquia San Pedro - 6:00 PM', 4),
  ('monaguillos-jueves-parroquia-1800', 'monaguillos-jueves', 'Parroquia San Pedro - 6:00 PM', 8),
  ('monaguillos-jueves-capilla-1800', 'monaguillos-jueves', 'Capilla San Judas - 6:00 PM', 4),
  ('monaguillos-viernes-parroquia-1000', 'monaguillos-viernes', 'Parroquia San Pedro - 10:00 AM (Viacrucis)', 8),
  ('monaguillos-viernes-parroquia-1700', 'monaguillos-viernes', 'Parroquia San Pedro - 5:00 PM (Oficios)', 8),
  ('monaguillos-viernes-parroquia-1800', 'monaguillos-viernes', 'Parroquia San Pedro - 6:00 PM (Siete Palabras)', 8),
  ('monaguillos-viernes-parroquia-1900', 'monaguillos-viernes', 'Parroquia San Pedro - 7:00 PM (Procesión del Silencio)', 8),
  ('monaguillos-viernes-capilla-1730', 'monaguillos-viernes', 'Capilla San Judas - 5:30 PM (Oficios)', 4),
  ('monaguillos-vigilia-parroquia-1900', 'monaguillos-vigilia', 'Parroquia San Pedro - 7:00 PM', 10),
  ('monaguillos-vigilia-capilla-1900', 'monaguillos-vigilia', 'Capilla San Judas - 7:00 PM', 6)
on conflict (id) do update
set
  ministry_key = excluded.ministry_key,
  label = excluded.label,
  capacity = excluded.capacity,
  is_active = true;
