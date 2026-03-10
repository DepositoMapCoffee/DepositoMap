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

  /** Selecciona un departamento y carga sus cafés */
  selectDept: (id: string) => Promise<void>;

  /** Deselecciona el departamento actual y limpia el panel */
  clearSelection: () => void;

  /** Carga los IDs de departamentos con cafés (al iniciar la app) */
  loadActiveDepts: () => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────

export const useCoffeeStore = create<CoffeeStore>((set) => ({
  // ─── Estado inicial ─────────────────────────────────────────────
  selectedDept: null,
  coffees: [],
  activeDepts: [],
  isLoading: false,

  // ─── Seleccionar departamento y cargar sus cafés ─────────────────
  selectDept: async (id: string) => {
    // Activamos el loading e indicamos el departamento
    set({ selectedDept: id, isLoading: true, coffees: [] });

    const { data, error } = await supabase
      .from('cafes')
      .select('*')
      .eq('departamento_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CoffeeStore] Error cargando cafés:', error.message);
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
      .select('departamento_id');

    if (error) {
      console.error('[CoffeeStore] Error cargando departamentos activos:', error.message);
      return;
    }

    // Extraer IDs únicos de departamentos con cafés
    const uniqueIds = [...new Set((data ?? []).map((row) => row.departamento_id))];
    set({ activeDepts: uniqueIds });
  },
}));
