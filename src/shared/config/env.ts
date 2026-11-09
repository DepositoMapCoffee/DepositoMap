/**
 * Variables de entorno validadas con Zod.
 *
 * - Validación perezosa: solo falla cuando se usa la variable, no al
 *   importar el módulo (el build de Next no necesita credenciales).
 * - `serverEnv()` NUNCA debe importarse desde un componente cliente.
 *
 * Portabilidad Vercel → VPS: lo único que cambia es el valor de estas
 * variables (ver .env.example).
 */
import { z } from 'zod';

const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.url().default('http://localhost:3000'),
});

const serverSchema = z.object({
  /** Cadena de conexión Postgres (Supabase hoy, Postgres del VPS mañana). */
  DATABASE_URL: z.string().min(1),
  /** Zona horaria del negocio: todas las reglas de reservas se evalúan aquí. */
  BUSINESS_TIMEZONE: z.string().default('America/Bogota'),
});

export type PublicEnv = z.infer<typeof publicSchema>;
export type ServerEnv = z.infer<typeof serverSchema>;

let _public: PublicEnv | null = null;
let _server: ServerEnv | null = null;

function format(error: z.ZodError) {
  return error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
}

export function publicEnv(): PublicEnv {
  if (_public) return _public;
  // Next solo inlinea NEXT_PUBLIC_* cuando se accede de forma literal.
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });
  if (!parsed.success) {
    throw new Error(`[env] Variables públicas inválidas:\n${format(parsed.error)}\nRevisa .env.local (ver .env.example).`);
  }
  return (_public = parsed.data);
}

export function serverEnv(): ServerEnv {
  if (typeof window !== 'undefined') {
    throw new Error('[env] serverEnv() no puede usarse en el navegador.');
  }
  if (_server) return _server;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`[env] Variables de servidor inválidas:\n${format(parsed.error)}\nRevisa .env.local (ver .env.example).`);
  }
  return (_server = parsed.data);
}
