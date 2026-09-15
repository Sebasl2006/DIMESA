-- ════════════════════════════════════════════════════════════════
-- DIMESA — Separar productos TRUSS que en realidad son Shampoo + Acondicionador
-- Pega y ejecuta este archivo completo en Supabase → SQL Editor → New query → Run
--
-- Estos 9 productos de TRUSS se subieron como un solo producto, pero
-- según el catálogo (páginas 2-3, sección "Shampoos & Conditioners")
-- cada uno viene en dos presentaciones: Shampoo y Acondicionador.
-- Este script:
--   1) Renombra el producto que ya existe agregándole "Shampoo".
--   2) Crea el producto "Acondicionador" que faltaba, con el mismo
--      precio y la misma descripción de beneficios (sin foto todavía,
--      igual que el de Shampoo — se le puede agregar foto después
--      desde Productos → Editar).
-- ════════════════════════════════════════════════════════════════

update productos set nombre = 'Deluxe Prime Shampoo' where id = '4cd634d6-0331-4fd6-859d-f1bdd6b16fac';
update productos set nombre = 'Ultra Hydration Plus Shampoo' where id = '2656d81e-7c37-4a53-af5c-67a510c57263';
update productos set nombre = 'Ultra Hydration Shampoo' where id = '6204502d-8319-4761-874c-76c052a6cc4b';
update productos set nombre = 'Miracle Summer Shampoo' where id = '4b97e68d-cac0-4085-97ef-a6e677fe33e8';
update productos set nombre = 'Miracle Shampoo' where id = 'c067c8c2-d92d-48cd-8c3b-74dff826d7aa';
update productos set nombre = 'Frizz Zero Shampoo' where id = '2dad19e9-acaf-4dcd-ba40-819eb5f6d109';
update productos set nombre = 'Curly Shampoo' where id = '7748f31d-d4b4-4a94-8e50-c1cd93541876';
update productos set nombre = 'Equilibrium Shampoo' where id = 'c36206cd-d4f1-47ba-98e2-5766202ed41a';
update productos set nombre = 'Nutri Infusion Shampoo' where id = 'c2c0aba3-a158-45dd-97b3-89e5533609b0';

insert into productos (nombre, descripcion, precio, marca, disponible) values
  ('Deluxe Prime Acondicionador', 'Reconstrucción. Para cabellos frágiles y sensibilizados con tendencia a la rotura. Reduce el daño químico, reconstrucción inmediata, protección contra daños.', 41, 'truss', true),
  ('Ultra Hydration Plus Acondicionador', 'Nutrición e hidratación. Para cabello extremadamente seco y dañado. Resistencia y protección, deja el cabello tratado químicamente más nutrido.', 41, 'truss', true),
  ('Ultra Hydration Acondicionador', 'Nutrición e hidratación. Para cabello seco y dañado. Promueve hidratación profunda, restaura y revitaliza las fibras capilares.', 41, 'truss', true),
  ('Miracle Summer Acondicionador', 'Nutrición e hidratación. Para cabello expuesto al sol, mar y piscina. Protege contra agresiones de rayos UV, mar y piscina.', 41, 'truss', true),
  ('Miracle Acondicionador', 'Nutrición e hidratación. Para cabello seco y poroso. Aumenta elasticidad y resistencia, reduce el frizz, brillo extraordinario.', 41, 'truss', true),
  ('Frizz Zero Acondicionador', 'Manejabilidad. Para cabellos con frizz y exceso de volumen. Efecto instantáneo, facilita la eliminación del encrespamiento.', 41, 'truss', true),
  ('Curly Acondicionador', 'Nutrición e hidratación. Para cabellos rizados u ondulados.', 41, 'truss', true),
  ('Equilibrium Acondicionador', 'Scalp care. Indicado para cuero cabelludo graso y puntas secas. Controla el balance de aceite y humedad.', 41, 'truss', true),
  ('Nutri Infusion Acondicionador', 'Nutrición e hidratación. Para cabello seco y reseco. Recupera la nutrición natural de la fibra, revitaliza el cabello muy seco.', 41, 'truss', true);
