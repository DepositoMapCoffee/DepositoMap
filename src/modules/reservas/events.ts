/**
 * Eventos que publica el módulo `reservas`.
 * Otros módulos (notificaciones, chatbot…) se suscriben sin que este
 * módulo sepa de ellos.
 */
export type CanalReserva = 'web' | 'whatsapp' | 'telefono' | 'presencial' | 'bot';

declare module '@/shared/events' {
  interface EventMap {
    'reserva.creada': { reservaId: string; canal: CanalReserva };
    'reserva.confirmada': { reservaId: string };
    'reserva.cancelada': { reservaId: string; motivo?: string };
  }
}
