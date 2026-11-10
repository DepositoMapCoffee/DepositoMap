import AppLegacy from '@/legacy/components/AppLegacy';
import { experienciasPublicas } from '@/modules/reservas';
import { estadoSesion } from '@/modules/identidad';
import { alternarFavoritoAction, misFavoritos } from '@/modules/catalogo';

/**
 * Inicio. Hoy monta el sitio anterior (SPA legacy) y le entrega:
 *  - las experiencias del motor de reservas (precios del panel), y
 *  - las server actions de sesión y favoritos (ingreso único, cookies httpOnly).
 * La página es estática: se regenera cada minuto y al guardar una experiencia;
 * lo personal (sesión, favoritos) se pide desde el navegador vía server actions.
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
  return (
    <AppLegacy
      experiencias={experiencias}
      fuentesSesion={{ estadoSesion, misFavoritos, alternarFavorito: alternarFavoritoAction }}
    />
  );
}
