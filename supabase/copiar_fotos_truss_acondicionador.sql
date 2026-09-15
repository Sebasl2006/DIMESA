-- ════════════════════════════════════════════════════════════════
-- DIMESA — Copiar la foto de cada Shampoo TRUSS a su Acondicionador
-- Pega y ejecuta este archivo completo en Supabase → SQL Editor → New query → Run
--
-- Copia la misma foto que ya está puesta en el producto "... Shampoo"
-- al producto "... Acondicionador" correspondiente (mismo envase,
-- ambos productos comparten imagen por ahora).
-- ════════════════════════════════════════════════════════════════

update productos set imagen_url = (select imagen_url from productos where id = '4cd634d6-0331-4fd6-859d-f1bdd6b16fac')
  where id = 'cb502653-7d55-4e9e-938f-4ba7e94deee7'; -- Deluxe Prime

update productos set imagen_url = (select imagen_url from productos where id = '2656d81e-7c37-4a53-af5c-67a510c57263')
  where id = '71c29255-4c48-43b3-9348-22141f6e27c1'; -- Ultra Hydration Plus

update productos set imagen_url = (select imagen_url from productos where id = '6204502d-8319-4761-874c-76c052a6cc4b')
  where id = 'd574e7b6-1137-45a9-a851-51cb08080314'; -- Ultra Hydration

update productos set imagen_url = (select imagen_url from productos where id = '4b97e68d-cac0-4085-97ef-a6e677fe33e8')
  where id = '3a15932b-c868-4e2e-a394-775d5d33fc76'; -- Miracle Summer

update productos set imagen_url = (select imagen_url from productos where id = 'c067c8c2-d92d-48cd-8c3b-74dff826d7aa')
  where id = '57979ac4-c9f2-4532-ae4e-5719e6cdb5d7'; -- Miracle

update productos set imagen_url = (select imagen_url from productos where id = '2dad19e9-acaf-4dcd-ba40-819eb5f6d109')
  where id = 'bf93bb2b-8abd-4ce2-b169-6b548ee5c368'; -- Frizz Zero

update productos set imagen_url = (select imagen_url from productos where id = '7748f31d-d4b4-4a94-8e50-c1cd93541876')
  where id = '29649740-c75a-4e3a-8b3c-09303ea5a4e4'; -- Curly

update productos set imagen_url = (select imagen_url from productos where id = 'c36206cd-d4f1-47ba-98e2-5766202ed41a')
  where id = 'd963e365-98a8-429c-b460-e0f768d800b7'; -- Equilibrium

update productos set imagen_url = (select imagen_url from productos where id = 'c2c0aba3-a158-45dd-97b3-89e5533609b0')
  where id = '706e46bb-1df0-44e2-b4ac-3e602eeeb396'; -- Nutri Infusion
