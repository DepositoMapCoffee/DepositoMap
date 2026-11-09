/**
 * Conexión a Postgres con Drizzle ORM (solo servidor).
 *
 * Portabilidad: funciona igual contra Supabase (hoy) y contra el Postgres
 * del VPS (mañana); solo cambia DATABASE_URL.
 *
 * - `prepare: false`: requerido por el pooler de Supabase en modo
 *   transacción (puerto 6543) y por PgBouncer; inocuo en conexión directa.
 * - Se cachea en globalThis para no abrir conexiones nuevas en cada HMR.
 *
 * Cada módulo define sus tablas en src/modules/<modulo>/data/schema.ts y
 * las consulta con `db()` desde su propia capa data/.
 */
import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { serverEnv } from '@/shared/config/env';

type DB = PostgresJsDatabase;

const globalForDb = globalThis as unknown as { __deposito_db?: DB };

export function db(): DB {
  if (!globalForDb.__deposito_db) {
    const client = postgres(serverEnv().DATABASE_URL, {
      prepare: false,
      max: process.env.NODE_ENV === 'production' ? 10 : 3,
    });
    globalForDb.__deposito_db = drizzle(client);
  }
  return globalForDb.__deposito_db;
}
