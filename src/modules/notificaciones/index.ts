/**
 * Módulo `notificaciones` — avisos al cliente y al equipo.
 * Hoy: (fase 3) correo. Mañana: WhatsApp, SMS… cada canal es un adaptador
 * en ./canales que implementa la misma interfaz `Canal`.
 *
 * No exporta funciones para que otros lo llamen: REACCIONA a eventos
 * (ver ./subscribers.ts).
 */
export type { Canal, Mensaje } from './canales/tipos';
