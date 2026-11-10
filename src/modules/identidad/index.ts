/**
 * Módulo `identidad` — sesión única de clientes y administradores.
 * API PÚBLICA: re-expone el adaptador de auth para que los demás módulos
 * no dependan del proveedor (Supabase hoy).
 */
import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin, type CurrentUser } from '@/shared/infra/auth';

export { getCurrentUser, isAdmin, requireAdmin, UnauthorizedError, type CurrentUser } from '@/shared/infra/auth';
export { estadoSesion, salir, type SesionPublica } from './actions/sesion';
export { FormIngreso } from './ui/FormIngreso';
export { BotonSalir } from './ui/BotonSalir';

/** Admin de la petición actual, o null. */
export async function adminActual() {
  const usuario = await getCurrentUser();
  return usuario && (await isAdmin(usuario)) ? usuario : null;
}

/**
 * Para PÁGINAS del panel: devuelve el admin o redirige.
 * Sin sesión → /ingresar; con sesión de cliente → /cuenta.
 * (Las server actions usan requireAdmin(), que lanza un error en vez de redirigir.)
 */
export async function adminOIngresar(): Promise<CurrentUser> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect('/ingresar?siguiente=/panel/reservas');
  if (!(await isAdmin(usuario))) redirect('/cuenta');
  return usuario;
}

/** Para páginas de cliente: devuelve el usuario o lo manda a ingresar. */
export async function usuarioOIngresar(siguiente: string): Promise<CurrentUser & { esAdmin: boolean }> {
  const usuario = await getCurrentUser();
  if (!usuario) redirect(`/ingresar?siguiente=${encodeURIComponent(siguiente)}`);
  return { ...usuario, esAdmin: await isAdmin(usuario) };
}
