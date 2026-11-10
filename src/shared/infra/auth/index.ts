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

/**
 * Opciones forzadas en las cookies de sesión: el panel solo usa la sesión
 * desde el servidor, así que JavaScript del navegador nunca necesita leerlas
 * (httpOnly evita que un script inyectado robe la sesión).
 */
export const OPCIONES_COOKIE_SESION = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

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
          toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, ...OPCIONES_COOKIE_SESION }));
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

export type ResultadoRegistro =
  | { ok: true; requiereConfirmacion: boolean }
  | { ok: false; motivo: string };

/**
 * Crea una cuenta con correo y clave. Si el proyecto de Supabase exige
 * confirmar el correo, no hay sesión hasta que el usuario abra el enlace
 * (que vuelve a `redirigirA`, donde se canjea el código).
 */
export async function registrarConClave(
  email: string,
  clave: string,
  datos: Record<string, string>,
  redirigirA: string,
): Promise<ResultadoRegistro> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: clave,
    options: { data: datos, emailRedirectTo: redirigirA },
  });
  if (error) {
    const motivo = /already registered|already exists/i.test(error.message)
      ? 'Ya existe una cuenta con ese correo. Ingresa con tu contraseña.'
      : /password/i.test(error.message)
        ? 'La contraseña no cumple los requisitos (mínimo 8 caracteres).'
        : /rate limit|too many/i.test(error.message)
          ? 'Demasiados intentos. Espera unos minutos.'
          : 'No pudimos crear la cuenta. Inténtalo de nuevo.';
    return { ok: false, motivo };
  }
  return { ok: true, requiereConfirmacion: !data.session };
}

/** Canjea el código del enlace de confirmación por una sesión. */
export async function confirmarCodigoCorreo(codigo: string): Promise<boolean> {
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(codigo);
  return !error;
}
