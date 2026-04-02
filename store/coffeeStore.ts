/**
 * store/coffeeStore.ts
 * ─────────────────────────────────────────────────────────────────
 * Estado global de la aplicación con Zustand.
 *
 * Centraliza la lógica de estado para:
 * - Departamento seleccionado en el mapa
 * - Lista de cafés del departamento activo
 * - Lista de IDs de departamentos que tienen cafés
 * - Estado de carga
 *
 * Zustand permite acceder y mutar el estado sin Context ni Redux,
 * con una API mínima y un bajo overhead de re-renders.
 * ─────────────────────────────────────────────────────────────────
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Coffee } from '@/types';

// ─── Tipos del store ──────────────────────────────────────────────

interface CoffeeStore {
  /** ID del departamento actualmente seleccionado (null = ninguno) */
  selectedDept: string | null;

  /** Lista de cafés del departamento seleccionado */
  coffees: Coffee[];

  /** IDs de departamentos que tienen al menos un café registrado */
  activeDepts: string[];

  /** true mientras se cargan cafés de un departamento */
  isLoading: boolean;

  // ─── Acciones ──────────────────────────────────────────────────

  /** Selecciona un departamento e inicia la carga inicial */
  selectDept: (id: string) => Promise<void>;

  /** Carga o filtra los cafés con parámetros de búsqueda y categoría (Server-side) */
  fetchCoffees: (deptId: string, search?: string, category?: string) => Promise<void>;

  /** Deselecciona el departamento actual y limpia el panel */
  clearSelection: () => void;

  /** Carga los IDs de departamentos con cafés (al iniciar la app) */
  loadActiveDepts: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────

export const useCoffeeStore = create<CoffeeStore>((set, get) => ({
  // ─── Estado inicial ─────────────────────────────────────────────
  selectedDept: null,
  coffees: [],
  activeDepts: [],
  isLoading: false,

  // ─── Seleccionar departamento ────────────────────────────────────
  selectDept: async (id: string) => {
    set({ selectedDept: id });
    await get().fetchCoffees(id);
  },

  // ─── Cargar o filtrar cafés (Server-side) ────────────────────────
  fetchCoffees: async (deptId: string, search?: string, category?: string) => {
    set({ isLoading: true });

    let query = supabase
      .from('cafes')
      .select('*')
      .eq('departamento_id', deptId)
      .eq('visible', true);

    // Aplicar filtros en el servidor (Supabase)
    if (search) {
      // Busca en nombre o finca
      query = query.or(`nombre.ilike.%${search}%,finca.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('categoria', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('[CoffeeStore] Error filtrando cafés:', error.message);
      set({ isLoading: false });
      return;
    }

    set({ coffees: data as Coffee[], isLoading: false });
  },

  // ─── Limpiar selección ──────────────────────────────────────────
  clearSelection: () => {
    set({ selectedDept: null, coffees: [], isLoading: false });
  },

  // ─── Cargar departamentos activos ───────────────────────────────
  loadActiveDepts: async () => {
    const { data, error } = await supabase
      .from('cafes')
      .select('departamento_id')
      .eq('visible', true);

    if (error) {
      console.error('[CoffeeStore] Error cargando departamentos activos:', error.message);
      return;
    }

    // Extraer IDs únicos de departamentos con cafés
    const uniqueIds = [...new Set((data ?? []).map((row) => row.departamento_id))];
    set({ activeDepts: uniqueIds });
  },
}));
