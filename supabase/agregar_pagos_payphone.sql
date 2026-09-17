-- ════════════════════════════════════════════════════════════════
-- DIMESA — Pago con tarjeta real (Payphone)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

-- "Aparca" los datos del pedido mientras el cliente paga con tarjeta en
-- Payphone (que redirige fuera del sitio y de vuelta). Se crea justo antes
-- de mandar al cliente a Payphone y se borra al confirmar el pago — ver
-- src/app/productos/checkout/actions.ts (iniciarPagoTarjeta / confirmarPagoTarjeta).
-- Si el cliente nunca vuelve a confirmar, Payphone reversa el cobro solo a
-- los 5 minutos, así que una fila que se queda aquí no significa que se
-- cobró de más — es un pedido que nunca se completó.
create table if not exists pedidos_pendientes (
  client_transaction_id text primary key,
  cliente_nombre text not null,
  cliente_email text not null,
  cliente_telefono text not null,
  cliente_provincia text not null default '',
  cliente_ciudad text not null default '',
  cliente_direccion text not null default '',
  cliente_referencia text not null default '',
  productos jsonb not null,
  cargo_envio numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

alter table pedidos_pendientes enable row level security;

-- Solo la service_role key la toca (nadie desde el navegador ni el admin
-- necesita leer esta tabla directamente), así que no hace falta ninguna
-- policy de RLS — enable row level security sin políticas ya bloquea todo
-- acceso salvo el de la service_role, que ignora RLS.
grant select, insert, delete on pedidos_pendientes to service_role;

-- Para guardar a qué transacción de Payphone corresponde cada pedido
-- pagado con tarjeta (sirve para reversos o reclamos).
alter table pedidos
  add column if not exists payphone_transaction_id bigint;
