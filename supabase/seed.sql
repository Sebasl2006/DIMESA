-- ════════════════════════════════════════════════════════════════
-- DIMESA — Datos de ejemplo (OPCIONAL)
-- Ejecuta esto después de schema.sql si quieres arrancar con el mismo
-- catálogo que trae el diseño original, editable luego desde /admin.
-- Los precios de "servicios" son placeholders ($XX en el diseño original)
-- — ajústalos a los precios reales desde el panel de administrador.
-- ════════════════════════════════════════════════════════════════

insert into productos (nombre, descripcion, precio, categoria, disponible) values
  ('Ritual de Reparación Capilar', 'Shampoo, mascarilla y sérum reparador en un solo set de cuidado profesional para cabello tratado o dañado.', 45.00, 'capilar', true),
  ('Shampoo Reparador', 'Fórmula sin sulfatos para cabello dañado y tratado.', 22.00, 'capilar', true),
  ('Mascarilla Nutritiva', 'Hidratación profunda post-alisado o coloración.', 26.00, 'capilar', true),
  ('Sérum Anti-frizz', 'Control de frizz y brillo con protección térmica.', 24.00, 'capilar', true),
  ('Sérum Vitamina C', 'Luminosidad y uniformidad del tono de piel.', 34.00, 'facial', true),
  ('Crema Hidratante', 'Hidratación diaria para piel sensible.', 28.00, 'facial', true),
  ('Aceite Corporal', 'Nutrición e hidratación para piel seca.', 20.00, 'corporal', true),
  ('Exfoliante Corporal', 'Renovación celular y piel suave.', 18.00, 'corporal', true);

insert into servicios (nombre, descripcion, categoria, precio_desde) values
  ('Colorimetría y Estilo', 'Balayage y técnicas de aclaración, tintes y coloración, cortes y estilismo.', 'capilar', 25.00),
  ('Alisados y Estructura', 'Alisados progresivos y definitivos: keratina, botox capilar, plastificado.', 'capilar', 25.00),
  ('Salud y Recuperación Capilar', 'Diagnóstico de cuero cabelludo, terapias anticaída, hidratación profunda.', 'capilar', 25.00),
  ('Peinado y Mantenimiento', 'Lavado especializado, cauterización, sellado de puntas.', 'capilar', 25.00),
  ('Limpieza y Renovación Facial', 'Limpiezas faciales profundas, peeling químico y mecánico, tratamientos antiedad.', 'facial', 25.00),
  ('Mascarillas y Luminosidad', 'Mascarillas revitalizantes, control de acné, luminosidad facial.', 'facial', 25.00),
  ('Modeladores y Reductores', 'Masajes reductores, drenaje linfático, tratamiento de celulitis.', 'corporal', 25.00),
  ('Relajación y Bienestar', 'Exfoliación corporal, hidratación, masajes relajantes.', 'corporal', 25.00);
