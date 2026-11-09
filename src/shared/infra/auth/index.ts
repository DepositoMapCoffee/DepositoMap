/**
 * Adaptador de autenticación (solo servidor).
 *
 * Hoy: Supabase Auth leyendo la sesión desde cookies (@supabase/ssr).
 * Mañana (VPS): se puede reemplazar por Supabase self-hosted o Better Auth
 * cambiando SOLO este archivo; los módulos usan `getCurrentUser()` y
 * `requireAdmin()` sin saber qué proveedor hay detrás.
 */
import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { publicEnv } from '@/shared/config/env';

export type CurrentUser = {
  id: string;
  email: string;
};

/** Cliente Supabase ligado a las cookies de la petición actual. */
export async function supabaseServer() {
  const env = publicEnv();
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Llamado desde un Server Component: las cookies son de solo lectura.
          // El refresco de sesión lo hace el proxy/middleware o la siguiente acción.
        }
      },
    },
  });
}

/** Usuario autenticado de la petición actual, o null. Verifica el JWT con Supabase. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
}

/** ¿El usuario actual es administrador? (tabla public.admins) */
export async function isAdmin(user: CurrentUser | null): Promise<boolean> {
  if (!user) return false;
  const supabase = await supabaseServer();
  const { data } = await supabase.from('admins').select('email').eq('email', user.email).maybeSingle();
  return Boolean(data);
}

export class UnauthorizedError extends Error {
  constructor(message = 'No autorizado') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Exige un admin autenticado. Usar al inicio de TODA server action o página
 * administrativa: las server actions son invocables desde fuera de la UI.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || !(await isAdmin(user))) throw new UnauthorizedError();
  return user;
}
