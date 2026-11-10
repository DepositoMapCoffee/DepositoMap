/**
 * Eventos que publica el módulo `reservas`.
 * Otros módulos (notificaciones, chatbot…) se suscriben sin que este
 * módulo sepa de ellos.
 */
import type { Canal } from './domain/tipos';

export type CanalReserva = Canal;

declare module '@/shared/events' {
  interface EventMap {
    'reserva.creada': { reservaId: string; canal: CanalReserva };
    'reserva.confirmada': { reservaId: string };
    'reserva.cancelada': { reservaId: string; motivo?: string };
  }
}
