'use server';

/** Gestión del catálogo desde el panel. Todas verifican requireAdmin(). */
import { revalidatePath } from 'next/cache';
import { requireAdmin, UnauthorizedError } from '@/modules/identidad';
import { productoSchema } from '../domain/tipos';
import { DEPARTAMENTOS } from '../domain/departamentos';
import { actualizarProducto, cambiarVisibilidad, crearProducto, eliminarProducto } from '../data/productos';

export type ResultadoCatalogo = { ok: true; mensaje?: string } | { ok: false; error: string };
export type EstadoFormCatalogo = ResultadoCatalogo | { ok: null };

const refrescar = () => {
  revalidatePath('/panel/catalogo');
  revalidatePath('/');
};

async function comoAdmin(fn: () => Promise<ResultadoCatalogo>): Promise<ResultadoCatalogo> {
  try {
    await requireAdmin();
    return await fn();
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: 'Tu sesión expiró. Vuelve a ingresar.' };
    console.error('[catalogo/admin]', error);
    return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
  }
}

/** Crea (sin id) o actualiza (con id) un producto. */
export async function guardarProducto(_previo: EstadoFormCatalogo, formData: FormData): Promise<EstadoFormCatalogo> {
  return comoAdmin(async () => {
    const parsed = productoSchema.safeParse({
      ...Object.fromEntries(formData),
      visible: formData.get('visible') === 'on',
    });
    if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
    if (!DEPARTAMENTOS.some((d) => d.id === parsed.data.departamentoId)) return { ok: false, error: 'Departamento inválido' };

    const id = formData.get('id');
    if (typeof id === 'string' && id) {
      await actualizarProducto(id, parsed.data);
      refrescar();
      return { ok: true, mensaje: 'Cambios guardados.' };
    }
    await crearProducto(parsed.data);
    refrescar();
    return { ok: true, mensaje: `"${parsed.data.nombre}" agregado al catálogo.` };
  });
}

export async function alternarVisibilidad(id: string, visible: boolean): Promise<ResultadoCatalogo> {
  return comoAdmin(async () => {
    if (typeof id !== 'string' || typeof visible !== 'boolean') return { ok: false, error: 'Datos inválidos' };
    await cambiarVisibilidad(id, visible);
    refrescar();
    return { ok: true, mensaje: visible ? 'Ahora es visible en el mapa.' : 'Oculto del mapa.' };
  });
}

export async function eliminarProductoAction(id: string): Promise<ResultadoCatalogo> {
  return comoAdmin(async () => {
    if (typeof id !== 'string') return { ok: false, error: 'Datos inválidos' };
    await eliminarProducto(id);
    refrescar();
    return { ok: true, mensaje: 'Producto eliminado.' };
  });
}
