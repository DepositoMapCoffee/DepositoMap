/**
 * Refresco de la sesión en el proxy de Next (antes "middleware").
 *
 * Los tokens de Supabase caducan cada hora. Los Server Components no pueden
 * escribir cookies, así que el proxy renueva la sesión ANTES de renderizar y
 * reenvía las cookies nuevas al navegador.
 *
 * Solo es un refresco optimista: la autorización real se hace en cada página
 * y server action del panel con requireAdmin().
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Mismas opciones que en ./index.ts (no se importa: index.ts es 'server-only' y usa next/headers).
const OPCIONES_COOKIE_SESION = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
} as const;

export async function refrescarSesion(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, { ...options, ...OPCIONES_COOKIE_SESION }));
      },
    },
  });

  // getUser() valida el token con Supabase y dispara el refresco si hace falta.
  await supabase.auth.getUser();
  return response;
}
