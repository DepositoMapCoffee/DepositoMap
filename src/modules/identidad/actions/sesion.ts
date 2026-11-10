'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { cerrarSesionActual, getCurrentUser, iniciarSesionConClave, isAdmin } from '@/shared/infra/auth';

export type EstadoIngreso = { error: string | null };

const credenciales = z.object({
  email: z.email('Escribe un correo válido').trim().toLowerCase(),
  clave: z.string().min(1, 'Escribe tu contraseña'),
});

/** Ingreso al panel: solo continúa si el usuario está en la tabla de administradores. */
export async function ingresar(_previo: EstadoIngreso, formData: FormData): Promise<EstadoIngreso> {
  const parsed = credenciales.safeParse({ email: formData.get('email'), clave: formData.get('clave') });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const resultado = await iniciarSesionConClave(parsed.data.email, parsed.data.clave);
  if (!resultado.ok) return { error: resultado.motivo };

  const usuario = await getCurrentUser();
  if (!(await isAdmin(usuario))) {
    await cerrarSesionActual();
    return { error: 'Esta cuenta no tiene acceso al panel.' };
  }
  redirect('/panel/reservas');
}

export async function salir(): Promise<void> {
  await cerrarSesionActual();
  redirect('/panel/ingresar');
}
