import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Coffee } from '@/types';

interface UserStore {
  session: any | null;
  isAdmin: boolean;
  isLoadingSession: boolean;
  
  // Favoritos
  favoriteIds: string[];
  favoriteCoffees: Coffee[];
  isLoadingFavorites: boolean;

  // Acciones
  initAuth: () => void;
  loadFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (coffeeId: string) => Promise<{ success: boolean; requiresAuth?: boolean }>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  session: null,
  isAdmin: false,
  isLoadingSession: true,
  
  favoriteIds: [],
  favoriteCoffees: [],
  isLoadingFavorites: false,

  initAuth: () => {
    // Revisar sesión inicial
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        set({ session, isAdmin: (data?.length ?? 0) > 0, isLoadingSession: false });
        // Cargar favoritos
        get().loadFavorites(session.user.id);
      } else {
        set({ session: null, isAdmin: false, isLoadingSession: false, favoriteIds: [], favoriteCoffees: [] });
      }
    });

    // Escuchar cambios
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user?.email) {
        const { data } = await supabase.from('admins').select('*').eq('email', session.user.email);
        set({ session, isAdmin: (data?.length ?? 0) > 0 });
        get().loadFavorites(session.user.id);
      } else {
        set({ session: null, isAdmin: false, favoriteIds: [], favoriteCoffees: [] });
      }
    });
  },

  loadFavorites: async (userId: string) => {
    set({ isLoadingFavorites: true });
    
    // Obtenemos los IDs y los detalles de los cafés haciendo un join implícito con Supabase
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        coffee_id,
        cafes (*)
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('[UserStore] Error cargando favoritos:', error.message);
      set({ isLoadingFavorites: false });
      return;
    }

    const favoriteIds = data.map((fav: any) => fav.coffee_id);
    // Extraemos los objetos de cafes
    const favoriteCoffees = data.map((fav: any) => fav.cafes).filter(Boolean);

    set({ favoriteIds, favoriteCoffees, isLoadingFavorites: false });
  },

  toggleFavorite: async (coffeeId: string) => {
    const { session, favoriteIds } = get();
    
    if (!session?.user) {
      return { success: false, requiresAuth: true };
    }

    const userId = session.user.id;
    const isFavorited = favoriteIds.includes(coffeeId);

    if (isFavorited) {
      // Optimistic update
      set({ favoriteIds: favoriteIds.filter(id => id !== coffeeId) });
      
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('coffee_id', coffeeId);
        
      if (error) {
        // Revert on error
        set({ favoriteIds });
        console.error('Error al quitar favorito:', error);
        return { success: false };
      }
    } else {
      // Optimistic update
      set({ favoriteIds: [...favoriteIds, coffeeId] });
      
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, coffee_id: coffeeId });
        
      if (error) {
        // Revert on error
        set({ favoriteIds });
        console.error('Error al agregar favorito:', error);
        return { success: false };
      }
    }
    
    // Recargar la lista completa de objetos Coffee en background para tener los datos actualizados
    get().loadFavorites(userId);
    return { success: true };
  }
}));
