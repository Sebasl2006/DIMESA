-- ════════════════════════════════════════════════════════════════
-- DIMESA — Marcas dinámicas (antes eran un enum fijo en el código)
-- Pega y ejecuta este archivo completo en Supabase → SQL Editor → New query → Run
-- Permite crear marcas nuevas desde el admin (Productos → Agregar producto
-- → "+ Agregar marca nueva"), con su propia foto de fondo para el cuadro
-- que sale en la sección Productos de la página pública.
-- ════════════════════════════════════════════════════════════════

create table if not exists marcas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nombre text not null,
  imagen_url text,
  created_at timestamptz not null default now()
);

alter table marcas enable row level security;

create policy "Marcas son públicas"
  on marcas for select
  to public
  using (true);

create policy "Admin crea marcas"
  on marcas for insert
  to authenticated
  with check (true);

create policy "Admin actualiza marcas"
  on marcas for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin elimina marcas"
  on marcas for delete
  to authenticated
  using (true);

-- Además de las políticas de RLS de arriba, Postgres necesita este permiso
-- base sobre la tabla en sí (grants.sql tuvo el mismo problema con
-- "productos": sin esto da "permission denied for table marcas").
grant select on marcas to anon;
grant select, insert, update, delete on marcas to authenticated;

-- Semilla: las 5 marcas que ya existían antes de esta tabla (los productos
-- actuales ya usan estos mismos valores en su columna "marca") — con las
-- mismas fotos de fondo que ya se usaban a mano en la sección Productos.
insert into marcas (slug, nombre, imagen_url) values
  ('botanique', 'Botaniqué', '/images/botanique-fondo.webp'),
  ('revlon', 'Revlon', '/images/revlon-fondo.webp'),
  ('mq_professional', 'M|Q Professional', '/images/mq-fondo.webp'),
  ('truss', 'TRUSS', '/images/truss-fondo.webp'),
  ('olaplex', 'Olaplex', '/images/olaplex-fondo.webp')
on conflict (slug) do nothing;

-- La columna "marca" de productos tenía un check constraint que solo
-- dejaba pasar esas 5 palabras exactas — hay que quitarlo para poder
-- crear marcas nuevas. Esto busca y borra cualquier check constraint de
-- "productos" que mencione "marca" (sin depender de adivinar su nombre
-- exacto), y lo reemplaza por una relación de verdad contra la tabla
-- "marcas": cada producto debe apuntar a una marca que exista ahí.
do $$
declare
  c record;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'productos'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%marca%'
  loop
    execute format('alter table productos drop constraint %I', c.conname);
  end loop;
end $$;

alter table productos
  add constraint productos_marca_fkey foreign key (marca) references marcas(slug);
