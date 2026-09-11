-- ════════════════════════════════════════════════════════════════
-- DIMESA — Datos de la cuenta bancaria para pagos por transferencia
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

alter table informacion
  add column if not exists banco_nombre text,
  add column if not exists banco_tipo_cuenta text,
  add column if not exists banco_numero_cuenta text,
  add column if not exists banco_titular text,
  add column if not exists banco_identificacion text;
