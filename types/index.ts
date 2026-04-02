/**
 * types/index.ts
 * ─────────────────────────────────────────────────────────────────
 * Definición centralizada de tipos TypeScript para El Depòsito.
 * Todos los modelos de datos del proyecto se definen aquí para
 * garantizar consistencia entre componentes, store y Supabase.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── Café ────────────────────────────────────────────────────────

/**
 * Categorías disponibles para clasificar un café de especialidad.
 * - Regional: café representativo de una región geográfica
 * - Culturing: café cultivado con técnicas de cultivo especiales
 * - Varietal: café de una variedad botánica específica
 */
export type CoffeeCategory = 'Regional' | 'Culturing' | 'Varietal';

/**
 * Métodos de procesamiento post-cosecha del café.
 */
export type CoffeeProcess =
  | 'Lavado'
  | 'Natural'
  | 'Honey'
  | 'Anaeróbico'
  | 'Semi-Lavado'
  | string; // Permite valores personalizados

/**
 * Modelo principal de un café de especialidad.
 * Corresponde a una fila en la tabla `cafes` de Supabase.
 */
export interface Coffee {
  /** ID único generado por Supabase (UUID) */
  id: string;
  /** Nombre del lote o café */
  nombre: string;
  /** ID del departamento de origen (ej: 'CO-ANT') */
  departamento_id: string;
  /** Nombre de la finca de origen */
  finca: string;
  /** Altitud del cultivo en msnm (ej: '1850 msnm') */
  altura: string;
  /** Método de procesamiento post-cosecha */
  proceso: CoffeeProcess;
  /** Notas de cata / perfil de sabor */
  notas: string;
  /** Categoría de clasificación del café */
  categoria: CoffeeCategory;
  /** Si el café es visible para el público */
  visible: boolean;
  /** Fecha de creación (ISO 8601) */
  created_at: string;
}

/**
 * Datos del formulario de creación/edición de un café.
 * Omite `id` y `created_at` (generados por la base de datos).
 */
export type CoffeeFormData = Omit<Coffee, 'id' | 'created_at'>;

// ─── Departamento ─────────────────────────────────────────────────

/**
 * Representa un departamento de Colombia en el mapa interactivo.
 * Los paths SVG corresponden al viewBox 0 0 1000 1000.
 */
export interface Departamento {
  /** Código ISO del departamento (ej: 'CO-ANT') */
  id: string;
  /** Nombre visible del departamento (ej: 'Antioquia') */
  nombre: string;
  /** Descripción opcional del departamento */
  descripcion?: string;
  /** Path SVG del contorno del departamento */
  path: string;
  /** Color opcional para el departamento en el mapa */
  color?: string;
}
