/**
 * Módulo `identidad` — sesión de usuarios y administradores.
 * API PÚBLICA: re-expone el adaptador de auth para que los demás módulos
 * no dependan del proveedor (Supabase hoy).
 */
export { getCurrentUser, isAdmin, requireAdmin, UnauthorizedError, type CurrentUser } from '@/shared/infra/auth';
export { FormIngreso } from './ui/FormIngreso';
export { BotonSalir } from './ui/BotonSalir';

import { redirect } from 'next/navigation';
import { getCurrentUser, isAdmin, type CurrentUser } from '@/shared/infra/auth';

/** Admin de la petición actual, o null (para páginas del panel). */
export async function adminActual() {
  const usuario = await getCurrentUser();
  return usuario && (await isAdmin(usuario)) ? usuario : null;
}

/**
 * Para PÁGINAS del panel: devuelve el admin o redirige al ingreso.
 * (Las server actions usan requireAdmin(), que lanza un error en vez de redirigir.)
 */
export async function adminOIngresar(): Promise<CurrentUser> {
  const admin = await adminActual();
  if (!admin) redirect('/panel/ingresar');
  return admin;
}
