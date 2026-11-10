/**
 * Destino del enlace de confirmación de cuenta que envía Supabase.
 * Canjea el código por una sesión (cookies) y lleva al usuario a su cuenta.
 */
import { NextResponse } from 'next/server';
import { confirmarCodigoCorreo } from '@/shared/infra/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get('code');
  const siguiente = url.searchParams.get('siguiente') ?? '/cuenta';
  const destino = siguiente.startsWith('/') && !siguiente.startsWith('//') ? siguiente : '/cuenta';

  if (codigo && (await confirmarCodigoCorreo(codigo))) {
    return NextResponse.redirect(new URL(destino, url.origin));
  }
  return NextResponse.redirect(new URL('/ingresar?error=confirmacion', url.origin));
}
