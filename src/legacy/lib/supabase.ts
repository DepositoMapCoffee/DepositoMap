/**
 * lib/supabase.ts
 * ─────────────────────────────────────────────────────────────────
 * Cliente de Supabase para El Depòsito.
 *
 * Se crea una instancia única del cliente que se reutiliza
 * en todo el proyecto (patrón singleton a nivel de módulo).
 *
 * Las variables de entorno se leen desde .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL     → URL del proyecto Supabase
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY → Clave pública anónima
 *
 * IMPORTANTE: La validación de variables de entorno es perezosa (lazy)
 * para evitar errores al importar el módulo durante el prerenderizado
 * de Next.js en tiempo de build.
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// ─── Variables de entorno (validadas al primer uso) ──────────────

/**
 * Obtiene la URL de Supabase desde las variables de entorno.
 * Lanza error solo cuando se invoca, no al cargar el módulo.
 */
function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error(
      '[Supabase] Falta NEXT_PUBLIC_SUPABASE_URL. ' +
      'Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return url;
}

/**
 * Obtiene la Anon Key de Supabase desde las variables de entorno.
 * Lanza error solo cuando se invoca, no al cargar el módulo.
 */
function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new Error(
      '[Supabase] Falta NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }
  return key;
}

// ─── Instancia del cliente (lazy singleton) ───────────────────────

let _supabase: SupabaseClient | null = null;

function initSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey());
  }
  return _supabase;
}

/**
 * Devuelve el cliente de Supabase listo para usar en cualquier componente
 * o utilidad.
 *
 * La inicialización es perezosa: solo valida las variables de entorno y
 * crea la instancia en el primer uso. Reemplaza al antiguo Proxy `supabase`
 * (frágil: casts y binding manual por acceso) por un acceso explícito con
 * tipos reales de SupabaseClient, conservando el lazy-init para el build.
 *
 * @example
 * import { getSupabase } from '@/legacy/lib/supabase';
 * const { data } = await getSupabase().from('cafes').select('*');
 */
export function getSupabase(): SupabaseClient {
  return initSupabase();
}
