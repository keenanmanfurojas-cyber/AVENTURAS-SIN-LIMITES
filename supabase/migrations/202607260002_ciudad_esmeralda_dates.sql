begin;

-- Fechas que ya estaban publicadas en el flujo aprobado de Ciudad Esmeralda.
-- Las dos fechas marcadas inactivas aparecían agotadas; no se inventan reservas
-- para justificar cupos. El propietario debe revisar estas filas antes de
-- aplicar la migration a producción.
insert into public.tour_dates (
  tour_slug,
  tour_name,
  date,
  capacity,
  is_active,
  notes
)
values
  (
    'ciudad-esmeralda',
    'Tour Ciudad Esmeralda',
    '2026-07-26',
    12,
    false,
    'Fecha previamente mostrada como agotada.'
  ),
  (
    'ciudad-esmeralda',
    'Tour Ciudad Esmeralda',
    '2026-08-23',
    12,
    false,
    'Fecha previamente mostrada como agotada.'
  ),
  (
    'ciudad-esmeralda',
    'Tour Ciudad Esmeralda',
    '2026-08-30',
    12,
    true,
    'Fecha publicada en el flujo aprobado.'
  ),
  (
    'ciudad-esmeralda',
    'Tour Ciudad Esmeralda',
    '2026-09-20',
    12,
    true,
    'Fecha publicada en el flujo aprobado.'
  ),
  (
    'ciudad-esmeralda',
    'Tour Ciudad Esmeralda',
    '2026-10-25',
    12,
    true,
    'Fecha publicada en el flujo aprobado.'
  )
on conflict (tour_slug, date) do nothing;

commit;
