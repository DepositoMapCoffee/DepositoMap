/** Consultas de servidor para páginas del catálogo. */
import 'server-only';
import { adminOIngresar } from '@/modules/identidad';
import { nombreDepartamento } from './domain/departamentos';
import {
  conteoVisiblesPorDepartamento,
  listarProductos,
  productosFavoritos,
  productosVisibles,
  productosVisiblesRecientes,
} from './data/productos';

export async function datosCatalogoAdmin() {
  await adminOIngresar();
  return { productos: await listarProductos() };
}

export async function favoritosDe(usuarioId: string) {
  return productosFavoritos(usuarioId);
}

/** Datos públicos para la vitrina de la home: destacados y regiones de origen. */
export async function vitrinaCatalogo() {
  const [cafesDestacados, origenes] = await Promise.all([
    productosVisiblesRecientes('cafe', 4),
    conteoVisiblesPorDepartamento(),
  ]);
  return {
    cafesDestacados,
    origenes: origenes.map((o) => ({ ...o, nombre: nombreDepartamento(o.departamentoId) })),
    totalProductos: origenes.reduce((s, o) => s + o.total, 0),
  };
}

/** Productos visibles para el mapa de orígenes. */
export async function productosDelMapa() {
  return productosVisibles();
}
