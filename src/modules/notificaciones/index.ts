/**
 * Módulo `notificaciones` — avisos al cliente y al equipo.
 * Hoy: correo (adaptador en shared/infra/correo). Mañana: WhatsApp, SMS…
 *
 * Casi todo funciona REACCIONANDO a eventos (ver ./subscribers.ts).
 * Lo único que se invoca directamente es el envío de recordatorios,
 * disparado por el cron (ver ./recordatorios.ts).
 */
export { enviarRecordatoriosDeManana } from './recordatorios';
