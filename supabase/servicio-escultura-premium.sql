-- ════════════════════════════════════════════════════════════════
-- DIMESA — Agrega el servicio "Escultura premium" (corporal)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

insert into servicios (nombre, descripcion, categoria, precio_desde)
values (
  'Escultura premium',
  'Drenaje linfático + masajes reductores + maderoterapia + cavitación + radiofrecuencia + tratamiento reafirmante. Paquete premium de 15 sesiones.',
  'corporal',
  500
);
