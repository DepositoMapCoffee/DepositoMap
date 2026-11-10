'use server';

/**
 * Sesión única para todo el sitio: clientes y administradores entran por
 * /ingresar. Si la cuenta es de administrador, tiene además acceso al panel.
 */
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { POLITICA_DATOS } from '@/shared/config/negocio';
import { publicEnv } from '@/shared/config/env';
import {
  cerrarSesionActual,
  getCurrentUser,
  iniciarSesionConClave,
  isAdmin,
  registrarConClave,
} from '@/shared/infra/auth';

export type EstadoIngreso = { error: string | null; mensaje?: string };

const email = z.email('Escribe un correo válido').trim().toLowerCase();

/** Solo rutas internas (evita redirecciones abiertas a otros sitios). */
function destinoSeguro(valor: FormDataEntryValue | null): string | null {
  const v = typeof valor === 'string' ? valor : '';
  return v.startsWith('/') && !v.startsWith('//') ? v : null;
}

export async function ingresar(_previo: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const parsed = z
    .object({ email, clave: z.string().min(1, 'Escribe tu contraseña') })
    .safeParse({ email: formData.get('email'), clave: formData.get('clave') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const resultado = await iniciarSesionConClave(parsed.data.email, parsed.data.clave);
  if (!resultado.ok) return { error: resultado.motivo };

  const esAdmin = await isAdmin(await getCurrentUser());
  const siguiente = destinoSeguro(formData.get('siguiente'));
  if (esAdmin) redirect(siguiente ?? '/panel/reservas');
  // Un cliente nunca termina en el panel aunque el enlace lo pida.
  redirect(siguiente && !siguiente.startsWith('/panel') ? siguiente : '/cuenta');
}

export async function registrar(_previo: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const parsed = z
    .object({
      email,
      clave: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
      aceptaDatos: z.literal(true, { error: 'Debes aceptar la política de tratamiento de datos' }),
    })
    .safeParse({
      email: formData.get('email'),
      clave: formData.get('clave'),
      aceptaDatos: formData.get('aceptaDatos') === 'on',
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const sitio = publicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  const resultado = await registrarConClave(
    parsed.data.email,
    parsed.data.clave,
    // Prueba de autorización de datos (Ley 1581), guardada con la cuenta.
    { politica_datos_version: POLITICA_DATOS.version, autorizacion_datos_en: new Date().toISOString() },
    `${sitio}/auth/confirmar?siguiente=/cuenta`,
  );
  if (!resultado.ok) return { error: resultado.motivo };
  if (resultado.requiereConfirmacion) {
    return { error: null, mensaje: 'Te enviamos un correo para confirmar tu cuenta. Ábrelo y vuelve a ingresar.' };
  }
  redirect('/cuenta');
}

export async function salir(): Promise<void> {
  await cerrarSesionActual();
  redirect('/');
}

export type SesionPublica = { email: string; esAdmin: boolean } | null;

/** Quién está conectado (para la interfaz del sitio). No expone nada sensible. */
export async function estadoSesion(): Promise<SesionPublica> {
  const usuario = await getCurrentUser();
  if (!usuario) return null;
  return { email: usuario.email, esAdmin: await isAdmin(usuario) };
}
