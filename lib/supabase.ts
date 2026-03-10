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
 * ─────────────────────────────────────────────────────────────────
 */

import { createClient } from '@supabase/supabase-js';

// ─── Variables de entorno ─────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Validación en tiempo de ejecución ───────────────────────────

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Faltan variables de entorno. ' +
    'Crea un archivo .env.local con NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

// ─── Instancia del cliente ────────────────────────────────────────

/**
 * Cliente de Supabase listo para usar en cualquier componente o utilidad.
 *
 * @example
 * import { supabase } from '@/lib/supabase';
 * const { data } = await supabase.from('cafes').select('*');
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
