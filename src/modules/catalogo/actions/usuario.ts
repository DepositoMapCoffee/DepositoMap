'use server';

/** Favoritos del cliente. El usuario sale SIEMPRE de la sesión del servidor. */
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/modules/identidad';
import { alternarFavorito, idsFavoritos, productoVisible } from '../data/productos';

export type ResultadoFavorito =
  | { ok: true; favorito: boolean }
  | { ok: false; requiereIngreso: true }
  | { ok: false; requiereIngreso?: false; error: string };

export async function alternarFavoritoAction(productoId: string): Promise<ResultadoFavorito> {
  const usuario = await getCurrentUser();
  if (!usuario) return { ok: false, requiereIngreso: true };
  if (typeof productoId !== 'string' || !(await productoVisible(productoId))) {
    return { ok: false, error: 'Ese producto no está disponible.' };
  }
  const favorito = await alternarFavorito(usuario.id, productoId);
  revalidatePath('/cuenta');
  return { ok: true, favorito };
}

/** IDs de favoritos del usuario conectado (vacío si no hay sesión). */
export async function misFavoritos(): Promise<string[]> {
  const usuario = await getCurrentUser();
  return usuario ? idsFavoritos(usuario.id) : [];
}
