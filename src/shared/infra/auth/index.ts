/**
 * Adaptador de autenticación (solo servidor).
 *
 * Hoy: Supabase Auth leyendo la sesión desde cookies (@supabase/ssr).
 * Mañana (VPS): se puede reemplazar por Supabase self-hosted o Better Auth
 * cambiando SOLO este archivo; los módulos usan `getCurrentUser()` y
 * `requireAdmin()` sin saber qué proveedor hay detrás.
 */
import 'server-only';
import { cache } from 'react';
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

/**
 * Usuario autenticado de la petición actual, o null. Verifica el JWT con
 * Supabase. Memorizado por petición (cache): layout y página no repiten la llamada.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return { id: data.user.id, email: data.user.email };
});

/** ¿El usuario actual es administrador? (tabla public.admins) */
export const isAdmin = cache(async (user: CurrentUser | null): Promise<boolean> => {
  if (!user) return false;
  const supabase = await supabaseServer();
  const { data } = await supabase.from('admins').select('email').eq('email', user.email).maybeSingle();
  return Boolean(data);
});

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

export type ResultadoIngreso = { ok: true } | { ok: false; motivo: string };

/** Inicia sesión con correo y clave; la sesión queda en cookies httpOnly del dominio. */
export async function iniciarSesionConClave(email: string, clave: string): Promise<ResultadoIngreso> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: clave });
  if (error) {
    const motivo = /invalid login credentials/i.test(error.message)
      ? 'Correo o contraseña incorrectos.'
      : /rate limit|too many/i.test(error.message)
        ? 'Demasiados intentos. Espera unos minutos.'
        : 'No pudimos iniciar sesión. Inténtalo de nuevo.';
    return { ok: false, motivo };
  }
  return { ok: true };
}

export async function cerrarSesionActual(): Promise<void> {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
}
