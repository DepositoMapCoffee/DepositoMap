/** Consultas de servidor para páginas del catálogo. */
import 'server-only';
import { adminOIngresar } from '@/modules/identidad';
import { listarProductos, productosFavoritos } from './data/productos';

export async function datosCatalogoAdmin() {
  await adminOIngresar();
  return { productos: await listarProductos() };
}

export async function favoritosDe(usuarioId: string) {
  return productosFavoritos(usuarioId);
}
