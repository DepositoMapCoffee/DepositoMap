/**
 * Módulo `catalogo` — cafés y chocolates del mapa, y favoritos de clientes.
 * API PÚBLICA. (El mapa interactivo sigue en src/legacy hasta su rediseño.)
 */
export { datosCatalogoAdmin, favoritosDe } from './consultas';
export { alternarFavoritoAction, misFavoritos, type ResultadoFavorito } from './actions/usuario';
export { CatalogoAdmin } from './ui/CatalogoAdmin';
export { ListaFavoritos } from './ui/ListaFavoritos';
export type { Producto } from './domain/tipos';
