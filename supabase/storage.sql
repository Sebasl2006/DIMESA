-- ════════════════════════════════════════════════════════════════
-- DIMESA — Storage (fotos de productos y servicios)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- Crea el bucket público "dimesa" (no hace falta crearlo a mano en Storage)
-- y las políticas: cualquiera puede ver las fotos, solo el admin
-- (autenticado) puede subir/reemplazar/borrar.
-- ════════════════════════════════════════════════════════════════

insert into storage.buckets (id, name, public)
values ('dimesa', 'dimesa', true)
on conflict (id) do nothing;

create policy "Fotos de Dimesa son públicas"
  on storage.objects for select
  to public
  using (bucket_id = 'dimesa');

create policy "Admin sube fotos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'dimesa');

create policy "Admin reemplaza fotos"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'dimesa')
  with check (bucket_id = 'dimesa');

create policy "Admin borra fotos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'dimesa');
