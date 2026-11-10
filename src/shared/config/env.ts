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

  /**
   * Secreto para firmar los enlaces de gestión de reservas (/reserva/<código>?t=…).
   * Permite volver a generar el enlace en cada correo sin guardarlo en claro.
   * Cambiarlo invalida los enlaces ya enviados. Mínimo 32 caracteres.
   */
  RESERVAS_SECRETO: z.string().min(32, 'RESERVAS_SECRETO debe tener al menos 32 caracteres'),

  // ── Correo ──
  /** 'consola' (desarrollo: solo registra) o 'resend' (envío real). */
  EMAIL_PROVEEDOR: z.enum(['consola', 'resend']).default('consola'),
  RESEND_API_KEY: z.string().optional(),
  /** Remitente, con dominio verificado en el proveedor. */
  EMAIL_REMITENTE: z.string().default('El Depósito <onboarding@resend.dev>'),
  /** A dónde llegan las respuestas de los clientes. */
  EMAIL_RESPONDER_A: z.string().optional(),
  /** Correos del equipo que reciben aviso de cada reserva nueva (separados por coma). */
  EMAIL_AVISOS_NEGOCIO: z.string().optional(),

  /** Protege el endpoint del cron de recordatorios (Vercel Cron lo envía solo). */
  CRON_SECRET: z.string().optional(),
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
