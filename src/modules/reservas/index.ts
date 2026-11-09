/**
 * Módulo `reservas` — motor de reservas de Coffee Tasting.
 * API PÚBLICA: lo que no se exporte aquí es interno del módulo.
 */
import './events';

// Consultas para páginas (Server Components)
export { datosParaReservar, reservaParaGestion } from './consultas';
export { obtenerCalendario } from './actions/publicas';

// UI
export { FlujoReserva } from './ui/FlujoReserva';
export { GestionReserva } from './ui/GestionReserva';

// Tipos y eventos
export type { CanalReserva } from './events';
export type { Experiencia, ReservaPublica, EstadoReserva } from './domain/tipos';
