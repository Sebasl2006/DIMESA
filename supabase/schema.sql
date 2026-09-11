-- ════════════════════════════════════════════════════════════════
-- DIMESA — Esquema de base de datos
-- Pega y ejecuta este archivo completo en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Tabla: productos (tienda) ───────────────────────────────────
create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  precio numeric(10, 2) not null check (precio >= 0),
  categoria text not null check (categoria in ('capilar', 'facial', 'corporal')),
  imagen_url text,
  disponible boolean not null default true,
  created_at timestamptz not null default now()
);

-- ── Tabla: servicios (sección Reservas) ─────────────────────────
create table if not exists servicios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null default '',
  categoria text not null check (categoria in ('capilar', 'facial', 'corporal')),
  precio_desde numeric(10, 2) not null check (precio_desde >= 0),
  especialista text,
  imagen_url text,
  created_at timestamptz not null default now()
);

-- ── Tabla: pedidos (tienda → checkout) ──────────────────────────
create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente_nombre text not null,
  cliente_email text not null,
  cliente_telefono text not null,
  productos jsonb not null,
  total numeric(10, 2) not null check (total >= 0),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'cancelado')),
  metodo_pago text not null default 'tarjeta',
  created_at timestamptz not null default now()
);

-- ════════════════════════════════════════════════════════════════
-- Row Level Security
-- ════════════════════════════════════════════════════════════════

alter table productos enable row level security;
alter table servicios enable row level security;
alter table pedidos   enable row level security;

-- productos: lectura pública solo de disponibles; el admin (autenticado)
-- ve y gestiona todo.
create policy "Productos disponibles son públicos"
  on productos for select
  to anon
  using (disponible = true);

create policy "Admin ve todos los productos"
  on productos for select
  to authenticated
  using (true);

create policy "Admin crea productos"
  on productos for insert
  to authenticated
  with check (true);

create policy "Admin actualiza productos"
  on productos for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin elimina productos"
  on productos for delete
  to authenticated
  using (true);

-- servicios: lectura pública total (no tienen estado disponible/no disponible);
-- solo el admin (autenticado) escribe.
create policy "Servicios son públicos"
  on servicios for select
  to public
  using (true);

create policy "Admin crea servicios"
  on servicios for insert
  to authenticated
  with check (true);

create policy "Admin actualiza servicios"
  on servicios for update
  to authenticated
  using (true)
  with check (true);

create policy "Admin elimina servicios"
  on servicios for delete
  to authenticated
  using (true);

-- pedidos: nadie los lee/escribe directamente desde el navegador.
-- El checkout (Etapa 4) inserta pedidos desde una ruta de servidor de Next.js
-- usando la SUPABASE_SERVICE_ROLE_KEY, que ignora RLS — así un cliente nunca
-- puede fabricar un pedido con estado "pagado" directamente contra la base de datos.
-- El admin (autenticado) puede consultar sus propios pedidos si más adelante se
-- agrega esa vista al panel.
create policy "Admin ve pedidos"
  on pedidos for select
  to authenticated
  using (true);
