/**
 * Configuración de drizzle-kit (migraciones).
 * Cada módulo es dueño de sus tablas: se leen todos los schema.ts.
 * Las migraciones generadas viven en /drizzle y se aplican igual en
 * Supabase (hoy) y en el Postgres del VPS (mañana).
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/modules/*/data/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
  // Solo tablas del esquema public (auth.* lo gestiona Supabase).
  schemaFilter: ['public'],
});
