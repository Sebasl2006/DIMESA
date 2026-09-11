-- ════════════════════════════════════════════════════════════════
-- DIMESA — Varias cuentas bancarias para pagos por transferencia
-- (reemplaza las columnas de una sola cuenta por una lista, y ya
-- deja cargadas las 3 cuentas que mandó Sebastián)
-- Ejecuta esto en Supabase → SQL Editor → New query → Run
-- ════════════════════════════════════════════════════════════════

alter table informacion
  add column if not exists cuentas_bancarias jsonb not null default '[]'::jsonb;

alter table informacion
  drop column if exists banco_nombre,
  drop column if exists banco_tipo_cuenta,
  drop column if exists banco_numero_cuenta,
  drop column if exists banco_titular,
  drop column if exists banco_identificacion;

update informacion
set cuentas_bancarias = '[
  {"banco": "Banco Pichincha", "tipo_cuenta": "Cuenta de ahorros", "numero_cuenta": "2205075455", "identificacion": "0151815818"},
  {"banco": "Cooperativa JEP", "tipo_cuenta": "Cuenta de ahorros", "numero_cuenta": "406020420700", "identificacion": "0300978244"},
  {"banco": "Banco Guayaquil", "tipo_cuenta": "Cuenta de ahorros", "numero_cuenta": "40657465", "identificacion": "0300978244"}
]'::jsonb
where id = 1;
