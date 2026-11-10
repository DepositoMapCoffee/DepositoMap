/**
 * Proxy de Next.js (se ejecuta antes de cada petición que coincide).
 * Hoy solo renueva la sesión del panel administrativo.
 */
import type { NextRequest } from 'next/server';
import { refrescarSesion } from '@/shared/infra/auth/proxy';

export function proxy(request: NextRequest) {
  return refrescarSesion(request);
}

export const config = {
  matcher: ['/panel/:path*', '/cuenta/:path*', '/ingresar'],
};
