-- ═══════════════════════════════════════════════════════════════════
-- Datos iniciales del motor de reservas (Coffee Tasting).
-- Replica la configuración del sitio anterior:
--   - 2 experiencias (precios y duraciones de src/legacy/data/paquetes.ts)
--   - 3 franjas diarias (10:00, 14:00, 15:00), 4 cupos cada una, todos los días
--   - Reglas por defecto en tasting_ajustes
-- Todo es editable después desde el panel admin. Idempotente (ON CONFLICT).
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO "tasting_experiencias"
  ("id", "nombre", "resumen", "descripcion", "imagen", "tematica", "cafes", "idiomas", "ubicacion", "precio", "duracion_min", "orden")
VALUES
  (
    'tasting',
    'Coffee Tasting El Depósito',
    'Experiencia esencial de café de especialidad.',
    'Una experiencia esencial para quienes quieren descubrir el café de especialidad. Aprende sobre generalidades del café, las características de la caficultura colombiana y la preparación de cafés filtrados mientras degustas tres cafés excepcionales.',
    '/Tasting1.webp',
    'Generalidades del café, Características de la caficultura colombiana, Explicación de preparación cafés filtrados.',
    '3 cafés (Tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    ARRAY['Español', 'Inglés', 'Portugués'],
    'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    45000,
    30,
    1
  ),
  (
    'tasting-completo',
    'Coffee Tasting El Depósito Completo',
    'Experiencia completa y profunda de café de especialidad.',
    'La experiencia más profunda. Perfecta para quienes ya conocen el café especial y quieren ir más allá: origen, procesos de producción, panorama de mercado y una cata de cinco cafés que incluye fermentados con beneficios experimentales y premiados internacionalmente.',
    '/Tasting2.webp',
    'Generalidades del café, Caficultura colombiana, Explicación preparaciones café filtrado, Origen del café, Panorama de mercado, Profundización en procesos de producción.',
    '5 cafés (tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    ARRAY['Español', 'Inglés', 'Portugués'],
    'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    120000,
    60,
    2
  )
ON CONFLICT ("id") DO NOTHING;
--> statement-breakpoint

INSERT INTO "tasting_horarios" ("dia_semana", "hora_inicio", "capacidad")
SELECT d, h, 4
FROM generate_series(0, 6) AS d
CROSS JOIN (VALUES ('10:00'), ('14:00'), ('15:00')) AS horas(h)
ON CONFLICT ("dia_semana", "hora_inicio") DO NOTHING;
--> statement-breakpoint

INSERT INTO "tasting_ajustes" ("id") VALUES (1) ON CONFLICT ("id") DO NOTHING;
