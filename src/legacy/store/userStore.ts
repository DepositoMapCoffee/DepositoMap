/**
 * Sesión y favoritos para la SPA legacy (mapa y fichas de café).
 *
 * Ya no habla con Supabase desde el navegador: la sesión vive en cookies
 * httpOnly del servidor (ingreso único en /ingresar). La página de inicio
 * entrega aquí tres server actions y este store solo las invoca.
 */
import { create } from 'zustand';

export type SesionLegacy = { email: string; esAdmin: boolean } | null;
export type ResultadoFavoritoLegacy =
  | { ok: true; favorito: boolean }
  | { ok: false; requiereIngreso: true }
  | { ok: false; requiereIngreso?: false; error: string };

export type FuentesSesion = {
  estadoSesion: () => Promise<SesionLegacy>;
  misFavoritos: () => Promise<string[]>;
  alternarFavorito: (productoId: string) => Promise<ResultadoFavoritoLegacy>;
};

interface UserStore {
  session: { email: string } | null;
  isAdmin: boolean;
  isLoadingSession: boolean;
  favoriteIds: string[];
  fuentes: FuentesSesion | null;
  conectar: (fuentes: FuentesSesion) => Promise<void>;
  toggleFavorite: (coffeeId: string) => Promise<{ success: boolean; requiresAuth?: boolean }>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  session: null,
  isAdmin: false,
  isLoadingSession: true,
  favoriteIds: [],
  fuentes: null,

  conectar: async (fuentes) => {
    set({ fuentes });
    try {
      const sesion = await fuentes.estadoSesion();
      const favoritos = sesion ? await fuentes.misFavoritos() : [];
      set({
        session: sesion ? { email: sesion.email } : null,
        isAdmin: sesion?.esAdmin ?? false,
        favoriteIds: favoritos,
        isLoadingSession: false,
      });
    } catch {
      set({ session: null, isAdmin: false, favoriteIds: [], isLoadingSession: false });
    }
  },

  toggleFavorite: async (coffeeId) => {
    const { fuentes, favoriteIds } = get();
    if (!fuentes) return { success: false };
    const yaEstaba = favoriteIds.includes(coffeeId);
    // Actualización optimista; se revierte si el servidor falla.
    set({ favoriteIds: yaEstaba ? favoriteIds.filter((id) => id !== coffeeId) : [...favoriteIds, coffeeId] });
    try {
      const r = await fuentes.alternarFavorito(coffeeId);
      if (r.ok) return { success: true };
      set({ favoriteIds });
      return { success: false, requiresAuth: r.requiereIngreso === true };
    } catch {
      set({ favoriteIds });
      return { success: false };
    }
  },
}));
