-- ════════════════════════════════════════════════════════════════
-- DIMESA — provincia en "pedidos" (checkout, envío a domicilio)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

alter table pedidos add column if not exists cliente_provincia text not null default '';
