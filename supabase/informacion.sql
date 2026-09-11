-- ════════════════════════════════════════════════════════════════
-- DIMESA — Tabla "informacion" (bloque único: datos del local)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
--
-- A diferencia de productos/servicios/profesionales, esto NO es una
-- lista — es un solo registro (fila con id=1) que el admin edita desde
-- un formulario único en /admin/informacion. El "check (id = 1)"
-- garantiza que nunca pueda existir una segunda fila por error.
-- ════════════════════════════════════════════════════════════════

create table if not exists informacion (
  id int primary key default 1,
  titulo text not null default 'El salón',
  descripcion text not null default '',
  direccion text not null default '',
  horario text not null default '',
  telefono text not null default '',
  updated_at timestamptz not null default now(),
  constraint informacion_singleton check (id = 1)
);

insert into informacion (id) values (1)
on conflict (id) do nothing;

alter table informacion enable row level security;

create policy "Información es pública"
  on informacion for select
  to public
  using (true);

create policy "Admin actualiza información"
  on informacion for update
  to authenticated
  using (true)
  with check (true);

grant select on informacion to anon;
grant select, update on informacion to authenticated;
