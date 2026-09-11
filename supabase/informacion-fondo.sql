-- ════════════════════════════════════════════════════════════════
-- DIMESA — Fondo de la página (imagen de mármol de fondo en todo el
-- sitio, editable desde el admin)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

alter table informacion add column if not exists fondo_url text;
