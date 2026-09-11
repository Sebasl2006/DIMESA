-- ════════════════════════════════════════════════════════════════
-- DIMESA — Tabla "profesionales" (equipo del spa)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- (se agrega después de schema.sql; incluye tabla + RLS + GRANT,
-- los tres pasos que ya usamos para productos/servicios/pedidos)
-- ════════════════════════════════════════════════════════════════

create table if not exists profesionales (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  especialidad text not null default '',
  descripcion text not null default '',
  foto_url text,
  created_at timestamptz not null default now()
);

alter table profesionales enable row level security;

-- lectura pública total, solo el admin (autenticado) escribe.
create policy "Profesionales son públicos"
  on profesionales for select
  to public
  using (true);

create policy "Admin crea profesionales"
  on profesionales for insert
  to authenticated
  with check (true);

create policy "Admin actualiza profesionales"
  on profesionales for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin elimina profesionales"
  on profesionales for delete
  to authenticated
  using (true);

-- GRANT de tabla (capa aparte de RLS — sin esto da "permission denied for table").
grant select on profesionales to anon;
grant select, insert, update, delete on profesionales to authenticated;
