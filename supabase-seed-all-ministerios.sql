-- Seed único: TODOS los slots de Semana Santa 2026
-- Incluye: MEC, Monaguillos, Lectores, Coro, Ujieres y Sacristía
-- Seguro para re-ejecutar (usa ON CONFLICT).

begin;

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

insert into public.mec_slots (id, ministry_key, label, capacity)
values
  -- Coro
  ('coro-ramos-parroquia-sab-1800', 'coro-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 3),
  ('coro-ramos-parroquia-dom-0800', 'coro-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 3),
  ('coro-ramos-parroquia-dom-1000', 'coro-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 3),
  ('coro-ramos-parroquia-dom-1200', 'coro-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 3),
  ('coro-ramos-parroquia-dom-1800', 'coro-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 3),
  ('coro-ramos-capilla-dom-1100', 'coro-ramos', 'Capilla San Judas - Domingo 11:00 AM', 2),
  ('coro-lunes-parroquia-0800', 'coro-lunes', 'Parroquia San Pedro - 8:00 AM', 3),
  ('coro-lunes-parroquia-1800', 'coro-lunes', 'Parroquia San Pedro - 6:00 PM', 3),
  ('coro-martes-parroquia-0800', 'coro-martes', 'Parroquia San Pedro - 8:00 AM', 3),
  ('coro-martes-parroquia-1800', 'coro-martes', 'Parroquia San Pedro - 6:00 PM', 3),
  ('coro-miercoles-parroquia-1800', 'coro-miercoles', 'Parroquia San Pedro - 6:00 PM', 3),
  ('coro-jueves-parroquia-1800', 'coro-jueves', 'Parroquia San Pedro - 6:00 PM', 6),
  ('coro-jueves-capilla-1800', 'coro-jueves', 'Capilla San Judas - 6:00 PM', 3),
  ('coro-viernes-parroquia-1700', 'coro-viernes', 'Parroquia San Pedro - 5:00 PM (Oficios)', 4),
  ('coro-viernes-parroquia-1800', 'coro-viernes', 'Parroquia San Pedro - 6:00 PM (Siete Palabras)', 4),
  ('coro-viernes-capilla-1730', 'coro-viernes', 'Capilla San Judas - 5:30 PM (Oficios)', 3),
  ('coro-vigilia-parroquia-1900', 'coro-vigilia', 'Parroquia San Pedro - 7:00 PM', 8),
  ('coro-vigilia-capilla-1900', 'coro-vigilia', 'Capilla San Judas - 7:00 PM', 4),

  -- Lectores
  ('lectores-ramos-parroquia-sab-1800', 'lectores-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 5),
  ('lectores-ramos-parroquia-dom-0800', 'lectores-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 5),
  ('lectores-ramos-parroquia-dom-1000', 'lectores-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 5),
  ('lectores-ramos-parroquia-dom-1200', 'lectores-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 5),
  ('lectores-ramos-parroquia-dom-1800', 'lectores-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 5),
  ('lectores-ramos-capilla-dom-1100', 'lectores-ramos', 'Capilla San Judas - Domingo 11:00 AM', 4),
  ('lectores-lunes-parroquia-0800', 'lectores-lunes', 'Parroquia San Pedro - 8:00 AM', 1),
  ('lectores-lunes-parroquia-1800', 'lectores-lunes', 'Parroquia San Pedro - 6:00 PM', 1),
  ('lectores-martes-parroquia-0800', 'lectores-martes', 'Parroquia San Pedro - 8:00 AM', 2),
  ('lectores-martes-parroquia-1800', 'lectores-martes', 'Parroquia San Pedro - 6:00 PM', 2),
  ('lectores-miercoles-parroquia-1800', 'lectores-miercoles', 'Parroquia San Pedro - 6:00 PM', 2),
  ('lectores-jueves-parroquia-1800', 'lectores-jueves', 'Parroquia San Pedro - 6:00 PM', 4),
  ('lectores-jueves-capilla-1800', 'lectores-jueves', 'Capilla San Judas - 6:00 PM', 3),
  ('lectores-viernes-parroquia-1000', 'lectores-viernes', 'Parroquia San Pedro - 10:00 AM (Viacrucis)', 2),
  ('lectores-viernes-parroquia-1700', 'lectores-viernes', 'Parroquia San Pedro - 5:00 PM (Oficios)', 6),
  ('lectores-viernes-parroquia-1800', 'lectores-viernes', 'Parroquia San Pedro - 6:00 PM (Siete Palabras)', 3),
  ('lectores-viernes-capilla-1730', 'lectores-viernes', 'Capilla San Judas - 5:30 PM (Oficios)', 4),
  ('lectores-vigilia-parroquia-1900', 'lectores-vigilia', 'Parroquia San Pedro - 7:00 PM', 10),
  ('lectores-vigilia-capilla-1900', 'lectores-vigilia', 'Capilla San Judas - 7:00 PM', 6),

  -- Sacristia
  ('sacristia-ramos-parroquia-sab-1800', 'sacristia-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 4),
  ('sacristia-ramos-parroquia-dom-0800', 'sacristia-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 4),
  ('sacristia-ramos-parroquia-dom-1000', 'sacristia-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 4),
  ('sacristia-ramos-parroquia-dom-1200', 'sacristia-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 4),
  ('sacristia-ramos-parroquia-dom-1800', 'sacristia-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 4),
  ('sacristia-ramos-capilla-dom-1100', 'sacristia-ramos', 'Capilla San Judas - Domingo 11:00 AM', 3),
  ('sacristia-lunes-parroquia-0800', 'sacristia-lunes', 'Parroquia San Pedro - 8:00 AM', 3),
  ('sacristia-lunes-parroquia-1800', 'sacristia-lunes', 'Parroquia San Pedro - 6:00 PM', 3),
  ('sacristia-martes-parroquia-0800', 'sacristia-martes', 'Parroquia San Pedro - 8:00 AM', 3),
  ('sacristia-martes-parroquia-1800', 'sacristia-martes', 'Parroquia San Pedro - 6:00 PM', 3),
  ('sacristia-miercoles-parroquia-1800', 'sacristia-miercoles', 'Parroquia San Pedro - 6:00 PM', 3),
  ('sacristia-jueves-parroquia-1800', 'sacristia-jueves', 'Parroquia San Pedro - 6:00 PM', 4),
  ('sacristia-jueves-capilla-1800', 'sacristia-jueves', 'Capilla San Judas - 6:00 PM', 3),
  ('sacristia-viernes-parroquia-1000', 'sacristia-viernes', 'Parroquia San Pedro - 10:00 AM (Viacrucis)', 5),
  ('sacristia-viernes-parroquia-1700', 'sacristia-viernes', 'Parroquia San Pedro - 5:00 PM (Oficios)', 5),
  ('sacristia-viernes-parroquia-1800', 'sacristia-viernes', 'Parroquia San Pedro - 6:00 PM (Siete Palabras)', 5),
  ('sacristia-viernes-capilla-1730', 'sacristia-viernes', 'Capilla San Judas - 5:30 PM (Oficios)', 3),
  ('sacristia-vigilia-parroquia-1900', 'sacristia-vigilia', 'Parroquia San Pedro - 7:00 PM', 6),
  ('sacristia-vigilia-capilla-1900', 'sacristia-vigilia', 'Capilla San Judas - 7:00 PM', 4),

  -- Ujieres
  ('ujieres-ramos-parroquia-sab-1800', 'ujieres-ramos', 'Parroquia San Pedro - Sábado 6:00 PM', 6),
  ('ujieres-ramos-parroquia-dom-0800', 'ujieres-ramos', 'Parroquia San Pedro - Domingo 8:00 AM', 6),
  ('ujieres-ramos-parroquia-dom-1000', 'ujieres-ramos', 'Parroquia San Pedro - Domingo 10:00 AM', 6),
  ('ujieres-ramos-parroquia-dom-1200', 'ujieres-ramos', 'Parroquia San Pedro - Domingo 12:00 PM', 6),
  ('ujieres-ramos-parroquia-dom-1800', 'ujieres-ramos', 'Parroquia San Pedro - Domingo 6:00 PM', 6),
  ('ujieres-ramos-capilla-dom-1100', 'ujieres-ramos', 'Capilla San Judas - Domingo 11:00 AM', 4),
  ('ujieres-lunes-parroquia-0800', 'ujieres-lunes', 'Parroquia San Pedro - 8:00 AM', 4),
  ('ujieres-lunes-parroquia-1800', 'ujieres-lunes', 'Parroquia San Pedro - 6:00 PM', 4),
  ('ujieres-martes-parroquia-0800', 'ujieres-martes', 'Parroquia San Pedro - 8:00 AM', 4),
  ('ujieres-martes-parroquia-1800', 'ujieres-martes', 'Parroquia San Pedro - 6:00 PM', 4),
  ('ujieres-miercoles-parroquia-1800', 'ujieres-miercoles', 'Parroquia San Pedro - 6:00 PM', 6),
  ('ujieres-jueves-parroquia-1800', 'ujieres-jueves', 'Parroquia San Pedro - 6:00 PM', 10),
  ('ujieres-jueves-capilla-1800', 'ujieres-jueves', 'Capilla San Judas - 6:00 PM', 5),
  ('ujieres-viernes-parroquia-1000', 'ujieres-viernes', 'Parroquia San Pedro - 10:00 AM (Viacrucis)', 6),
  ('ujieres-viernes-parroquia-1700', 'ujieres-viernes', 'Parroquia San Pedro - 5:00 PM (Oficios)', 6),
  ('ujieres-viernes-parroquia-1800', 'ujieres-viernes', 'Parroquia San Pedro - 6:00 PM (Siete Palabras)', 6),
  ('ujieres-viernes-capilla-1730', 'ujieres-viernes', 'Capilla San Judas - 5:30 PM (Oficios)', 4),
  ('ujieres-vigilia-parroquia-1900', 'ujieres-vigilia', 'Parroquia San Pedro - 7:00 PM', 8),
  ('ujieres-vigilia-capilla-1900', 'ujieres-vigilia', 'Capilla San Judas - 7:00 PM', 5)
on conflict (id) do update
set
  ministry_key = excluded.ministry_key,
  label = excluded.label,
  capacity = excluded.capacity,
  is_active = true;

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

commit;

-- Verificación rápida
select split_part(ministry_key, '-', 1) as ministerio, count(*) as slots
from public.mec_slots
group by 1
order by 1;
