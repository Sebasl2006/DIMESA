-- ════════════════════════════════════════════════════════════════
-- DIMESA — Permisos base (GRANT)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
--
-- En Postgres, antes de que las políticas de RLS decidan qué FILAS puede
-- ver/editar un rol, primero necesita permiso para tocar la TABLA en sí
-- (eso es un GRANT, independiente de RLS). schema.sql solo creó las
-- políticas de RLS; este archivo agrega los GRANT que faltaban y que
-- causaban el error "permission denied for table productos".
-- ════════════════════════════════════════════════════════════════

grant usage on schema public to anon, authenticated;

-- productos: lectura pública (RLS ya filtra a solo disponibles),
-- el admin autenticado puede además insertar/actualizar/eliminar.
grant select on productos to anon;
grant select, insert, update, delete on productos to authenticated;

-- servicios: lectura pública total, solo el admin escribe.
grant select on servicios to anon;
grant select, insert, update, delete on servicios to authenticated;

-- pedidos: nadie lee/escribe desde el navegador salvo el admin autenticado
-- (los inserts reales del checkout van por la service_role key, que ya
-- ignora tanto GRANT como RLS).
grant select on pedidos to authenticated;
