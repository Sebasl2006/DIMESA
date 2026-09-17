-- ════════════════════════════════════════════════════════════════
-- DIMESA — Cargo por envío a domicilio
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
--
-- Agrega la columna "cargo_envio" a "pedidos" para guardar el cargo fijo
-- de envío a domicilio ya incluido en "total" (0 si el pedido fue
-- "recoger en tienda"). Sin esta columna, el checkout no puede guardar
-- ese dato y falla al confirmar el pedido.
-- ════════════════════════════════════════════════════════════════

alter table pedidos
  add column if not exists cargo_envio numeric(10, 2) not null default 0;
