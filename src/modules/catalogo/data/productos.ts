/**
 * Acceso a datos del catálogo (solo servidor). La autorización se verifica
 * en las server actions: aquí no se valida quién llama.
 */
import 'server-only';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/shared/infra/db';
import type { DatosProducto, Producto } from '../domain/tipos';
import { cafes, userFavorites } from './legacy';

const columnas = {
  id: cafes.id,
  nombre: cafes.nombre,
  departamentoId: cafes.departamentoId,
  tipo: cafes.tipoProducto,
  finca: cafes.finca,
  altura: cafes.altura,
  proceso: cafes.proceso,
  categoria: cafes.categoria,
  notas: cafes.notas,
  descripcionLarga: cafes.descripcionLarga,
  metodoSugerido: cafes.metodoSugerido,
  preparacion: cafes.preparacion,
  sugerencias: cafes.sugerencias,
  visible: cafes.visible,
  creadoEn: cafes.createdAt,
};

type Fila = { [K in keyof typeof columnas]: unknown };

function aProducto(f: Fila): Producto {
  return {
    ...(f as Omit<Producto, 'tipo' | 'visible' | 'creadoEn'>),
    tipo: f.tipo === 'chocolate' ? 'chocolate' : 'cafe',
    visible: f.visible !== false,
    creadoEn: f.creadoEn instanceof Date ? f.creadoEn.toISOString() : null,
  };
}

function aColumnas(d: DatosProducto) {
  return {
    nombre: d.nombre,
    departamentoId: d.departamentoId,
    tipoProducto: d.tipo,
    finca: d.finca,
    altura: d.altura,
    proceso: d.proceso,
    categoria: d.categoria,
    notas: d.notas,
    descripcionLarga: d.descripcionLarga,
    metodoSugerido: d.metodoSugerido,
    preparacion: d.preparacion,
    sugerencias: d.sugerencias,
    visible: d.visible,
  };
}

export async function listarProductos(): Promise<Producto[]> {
  const filas = await db().select(columnas).from(cafes).orderBy(desc(cafes.createdAt));
  return filas.map(aProducto);
}

export async function crearProducto(d: DatosProducto): Promise<void> {
  await db().insert(cafes).values(aColumnas(d));
}

export async function actualizarProducto(id: string, d: DatosProducto): Promise<void> {
  await db().update(cafes).set(aColumnas(d)).where(eq(cafes.id, id));
}

export async function cambiarVisibilidad(id: string, visible: boolean): Promise<void> {
  await db().update(cafes).set({ visible }).where(eq(cafes.id, id));
}

/** Los favoritos se borran en cascada (FK ON DELETE CASCADE). */
export async function eliminarProducto(id: string): Promise<void> {
  await db().delete(cafes).where(eq(cafes.id, id));
}

// ─── Favoritos ─────────────────────────────────────────────────────

export async function idsFavoritos(usuarioId: string): Promise<string[]> {
  const filas = await db()
    .select({ id: userFavorites.coffeeId })
    .from(userFavorites)
    .where(eq(userFavorites.userId, usuarioId));
  return filas.map((f) => f.id);
}

/** Favoritos del usuario (solo productos visibles). */
export async function productosFavoritos(usuarioId: string): Promise<Producto[]> {
  const filas = await db()
    .select(columnas)
    .from(userFavorites)
    .innerJoin(cafes, eq(cafes.id, userFavorites.coffeeId))
    .where(and(eq(userFavorites.userId, usuarioId), eq(cafes.visible, true)))
    .orderBy(asc(cafes.nombre));
  return filas.map(aProducto);
}

/** Alterna un favorito; devuelve si quedó marcado. */
export async function alternarFavorito(usuarioId: string, productoId: string): Promise<boolean> {
  const borrados = await db()
    .delete(userFavorites)
    .where(and(eq(userFavorites.userId, usuarioId), eq(userFavorites.coffeeId, productoId)))
    .returning({ id: userFavorites.coffeeId });
  if (borrados.length > 0) return false;
  await db().insert(userFavorites).values({ userId: usuarioId, coffeeId: productoId }).onConflictDoNothing();
  return true;
}

export async function productoVisible(id: string): Promise<boolean> {
  const [f] = await db().select({ visible: cafes.visible }).from(cafes).where(eq(cafes.id, id));
  return f?.visible === true;
}
