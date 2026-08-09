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

/** Tamaño de página para el catálogo (se pide PAGE_SIZE+1 para detectar si hay más) */
const PAGE_SIZE = 12;

/**
 * Token de secuencia para descartar respuestas obsoletas.
 * Cada fetch/loadMore incrementa el token; cuando llega una respuesta cuyo
 * token ya no es el más reciente, se descarta (evita que una búsqueda antigua
 * o un loadMore en vuelo sobrescriban resultados más nuevos — race condition).
 */
let fetchSeq = 0;

interface CoffeeStore {
  /** ID del departamento actualmente seleccionado (null = ninguno) */
  selectedDept: string | null;

  /** Lista de cafés del departamento seleccionado */
  coffees: Coffee[];

  /** IDs de departamentos que tienen al menos un café registrado */
  activeDepts: string[];

  /** true mientras se cargan cafés de un departamento */
  isLoading: boolean;

  /** true si quedan más cafés por cargar (paginación) */
  hasMore: boolean;

  // ─── Acciones ──────────────────────────────────────────────────

  /** Selecciona un departamento e inicia la carga inicial */
  selectDept: (id: string) => Promise<void>;

  /** Carga o filtra los cafés con parámetros de búsqueda y categoría (Server-side) */
  fetchCoffees: (deptId: string, search?: string, category?: string) => Promise<void>;

  /** Carga la siguiente página de cafés con los mismos filtros activos */
  loadMore: (search?: string, category?: string) => Promise<void>;

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
  hasMore: false,

  // ─── Seleccionar departamento ────────────────────────────────────
  selectDept: async (id: string) => {
    set({ selectedDept: id });
    await get().fetchCoffees(id);
  },

  // ─── Cargar o filtrar cafés (Server-side) ────────────────────────
  fetchCoffees: async (deptId: string, search?: string, category?: string) => {
    const seq = ++fetchSeq;
    set({ isLoading: true });

    // Se pide PAGE_SIZE+1 registros para detectar si existe una página siguiente
    let query = supabase
      .from('cafes')
      .select('*')
      .eq('departamento_id', deptId)
      .eq('visible', true)
      .range(0, PAGE_SIZE);

    // Aplicar filtros en el servidor (Supabase)
    if (search) {
      // Busca en nombre o finca
      query = query.or(`nombre.ilike.%${search}%,finca.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('categoria', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    // Respuesta obsoleta: otra búsqueda/carga más reciente ya tomó el control
    if (seq !== fetchSeq) return;

    if (error) {
      console.error('[CoffeeStore] Error filtrando cafés:', error.message);
      set({ isLoading: false });
      return;
    }

    const rows = (data ?? []) as Coffee[];
    set({
      coffees: rows.slice(0, PAGE_SIZE),
      hasMore: rows.length > PAGE_SIZE,
      isLoading: false,
    });
  },

  // ─── Cargar siguiente página (paginación) ───────────────────────
  loadMore: async (search?: string, category?: string) => {
    const { selectedDept, coffees } = get();
    if (!selectedDept) return;

    const seq = ++fetchSeq;
    set({ isLoading: true });

    let query = supabase
      .from('cafes')
      .select('*')
      .eq('departamento_id', selectedDept)
      .eq('visible', true)
      .range(coffees.length, coffees.length + PAGE_SIZE);

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,finca.ilike.%${search}%`);
    }

    if (category && category !== 'all') {
      query = query.eq('categoria', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    // Si entre la petición y la respuesta cambió la búsqueda o el departamento,
    // descartar esta página (los datos que se iban a concatenar ya no aplican).
    if (seq !== fetchSeq) return;

    if (error) {
      console.error('[CoffeeStore] Error cargando más cafés:', error.message);
      set({ isLoading: false });
      return;
    }

    const rows = (data ?? []) as Coffee[];
    set({
      coffees: [...coffees, ...rows.slice(0, PAGE_SIZE)],
      hasMore: rows.length > PAGE_SIZE,
      isLoading: false,
    });
  },

  // ─── Limpiar selección ──────────────────────────────────────────
  clearSelection: () => {
    set({ selectedDept: null, coffees: [], isLoading: false, hasMore: false });
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
