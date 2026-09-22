-- ════════════════════════════════════════════════════════════════
-- DIMESA — Servicios por profesional
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
--
-- Cada servicio guarda ahora la lista de profesionales que lo hacen
-- (sus ids de la tabla "profesionales"). Así, cuando un cliente elige
-- "Reservar con [profesional]", la página de Reservas muestra solo los
-- servicios de esa persona. Un servicio sin nadie marcado solo aparece
-- cuando el cliente entra a Reservas directo, sin elegir profesional.
-- ════════════════════════════════════════════════════════════════

alter table servicios
  add column if not exists profesionales_ids uuid[] not null default '{}';
