import AppLegacy from '@/legacy/components/AppLegacy';
import { experienciasPublicas } from '@/modules/reservas';

/**
 * Inicio. Hoy monta el sitio anterior (SPA legacy) pasándole las
 * experiencias del motor de reservas, para que precios y paquetes sean
 * siempre los del panel. Se regenera cada minuto y al guardar una
 * experiencia en el panel (revalidatePath('/')).
 */
export const revalidate = 60;

export default async function PaginaInicio() {
  const experiencias = (await experienciasPublicas()).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    descripcion: e.descripcion,
    imagen: e.imagen,
    cafes: e.cafes,
    idiomas: e.idiomas,
    precio: e.precio,
    duracionMin: e.duracionMin,
  }));
  return <AppLegacy experiencias={experiencias} />;
}
