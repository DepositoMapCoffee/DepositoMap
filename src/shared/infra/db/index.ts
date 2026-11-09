/**
 * Conexión a Postgres con Drizzle ORM (solo servidor).
 *
 * Portabilidad: funciona igual contra Supabase (hoy) y contra el Postgres
 * del VPS (mañana); solo cambia DATABASE_URL.
 *
 * - `prepare: false` y `max_pipeline: 1`: requeridos por el pooler de Supabase en modo
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
      // Una consulta a la vez por conexión: el pooler de Supabase (Supavisor,
      // modo transacción) se cuelga con consultas encoladas (pipelining) en la
      // misma conexión. Comprobado: 5 consultas con max=3 → timeout; con 1 → OK.
      max_pipeline: 1,
      max: process.env.NODE_ENV === 'production' ? 10 : 5,
      connect_timeout: 10,
    });
    globalForDb.__deposito_db = drizzle(client);
  }
  return globalForDb.__deposito_db;
}
