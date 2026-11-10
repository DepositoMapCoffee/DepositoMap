/**
 * Módulo `catalogo` — cafés y chocolates del mapa, y favoritos de clientes.
 * API PÚBLICA. (El mapa interactivo sigue en src/legacy hasta su rediseño.)
 */
export { datosCatalogoAdmin, favoritosDe, vitrinaCatalogo, productosDelMapa } from './consultas';
export { nombreDepartamento } from './domain/departamentos';
export { alternarFavoritoAction, misFavoritos, type ResultadoFavorito } from './actions/usuario';
export { CatalogoAdmin } from './ui/CatalogoAdmin';
export { ListaFavoritos } from './ui/ListaFavoritos';
export { MapaOrigenes } from './ui/MapaOrigenes';
export type { Producto } from './domain/tipos';
