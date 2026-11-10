/**
 * Tipos y reglas del catálogo de productos (cafés y chocolates).
 * Tabla `cafes` (creada antes de v2; ver data/legacy.ts).
 */
import { z } from 'zod';

export const TIPOS_PRODUCTO = ['cafe', 'chocolate'] as const;
export type TipoProducto = (typeof TIPOS_PRODUCTO)[number];

export const CATEGORIAS_CAFE = ['Regional', 'Culturing', 'Varietal'] as const;
export const CATEGORIA_CHOCOLATE = 'Chocolate';

export const PROCESOS_SUGERIDOS = ['Lavado', 'Natural', 'Honey', 'Anaeróbico', 'Semi-Lavado'];
export const CACAO_SUGERIDO = ['62% Cacao', '72% Cacao', '86% Cacao', '100% Cacao'];
export const PRESENTACIONES_SUGERIDAS = ['40 gr', '60 gr', '80 gr'];
export const METODOS_SUGERIDOS = ['V60', 'Chemex', 'AeroPress', 'Prensa Francesa', 'Moka Pot', 'Espresso', 'Cold Brew'];

export type Producto = {
  id: string;
  nombre: string;
  departamentoId: string;
  tipo: TipoProducto;
  finca: string | null;
  /** Café: altura (msnm). Chocolate: presentación (peso). */
  altura: string | null;
  /** Café: proceso. Chocolate: porcentaje de cacao. */
  proceso: string | null;
  categoria: string | null;
  notas: string | null;
  descripcionLarga: string | null;
  metodoSugerido: string | null;
  preparacion: string | null;
  sugerencias: string | null;
  visible: boolean;
  creadoEn: string | null;
};

const texto = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, 'Escribe el nombre').max(120),
  departamentoId: z.string().min(1, 'Elige el departamento'),
  tipo: z.enum(TIPOS_PRODUCTO),
  finca: texto(120),
  altura: texto(60),
  proceso: texto(60),
  categoria: texto(40),
  notas: texto(300),
  descripcionLarga: texto(3000),
  metodoSugerido: texto(60),
  preparacion: texto(1500),
  sugerencias: texto(1500),
  visible: z.boolean(),
});

export type DatosProducto = z.infer<typeof productoSchema>;
