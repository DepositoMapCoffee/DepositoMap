/**
 * Módulo `reservas` — motor de reservas de Coffee Tasting.
 * API PÚBLICA: lo que no se exporte aquí es interno del módulo.
 */
import './events';

// Consultas para páginas (Server Components)
export { datosParaReservar, reservaParaGestion, datosAgenda, datosReservaManual, datosConfiguracion } from './consultas';
export { obtenerCalendario } from './actions/publicas';

// UI pública
export { FlujoReserva } from './ui/FlujoReserva';
export { GestionReserva } from './ui/GestionReserva';

// UI del panel administrativo
export { Agenda } from './ui/admin/Agenda';
export { FormReservaManual } from './ui/admin/FormReservaManual';
export { Configuracion } from './ui/admin/Configuracion';

// Tipos y eventos
export type { CanalReserva } from './events';
export type { Experiencia, ReservaPublica, EstadoReserva } from './domain/tipos';
