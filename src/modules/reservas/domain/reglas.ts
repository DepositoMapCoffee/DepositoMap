/**
 * Ciclo de vida de una reserva y reglas de cancelación.
 */
import { minutosHasta, type Ahora, type Fecha, type Hora } from './tiempo';
import type { EstadoReserva } from './tipos';

/** Transiciones de estado permitidas (las del admin). */
export const TRANSICIONES: Record<EstadoReserva, readonly EstadoReserva[]> = {
  pendiente: ['confirmada', 'cancelada'],
  confirmada: ['completada', 'no_show', 'cancelada'],
  completada: [],
  cancelada: [],
  no_show: [],
};

export function puedeTransicionar(de: EstadoReserva, a: EstadoReserva): boolean {
  return TRANSICIONES[de].includes(a);
}

export const ETIQUETAS_ESTADO: Record<EstadoReserva, string> = {
  pendiente: 'Pendiente',
  confirmada: 'Confirmada',
  completada: 'Completada',
  cancelada: 'Cancelada',
  no_show: 'No asistió',
};

export type ResultadoCancelacion = { ok: true } | { ok: false; motivo: string };

/** ¿Puede el CLIENTE cancelar en línea? (el admin siempre puede por transición) */
export function puedeCancelarCliente(
  reserva: { estado: EstadoReserva; fecha: Fecha; horaInicio: Hora },
  ahora: Ahora,
  horasMinCancelacion: number,
): ResultadoCancelacion {
  if (reserva.estado === 'cancelada') return { ok: false, motivo: 'Esta reserva ya fue cancelada.' };
  if (reserva.estado !== 'pendiente' && reserva.estado !== 'confirmada') {
    return { ok: false, motivo: 'Esta reserva ya no se puede cancelar.' };
  }
  if (minutosHasta(ahora, reserva.fecha, reserva.horaInicio) < horasMinCancelacion * 60) {
    return {
      ok: false,
      motivo: `Las cancelaciones en línea se aceptan hasta ${horasMinCancelacion} horas antes. Escríbenos para ayudarte.`,
    };
  }
  return { ok: true };
}

const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin 0/O, 1/I/L

/** Código legible para el cliente, p. ej. DEP-7K3QX. */
export function generarCodigo(aleatorio: () => number = Math.random): string {
  let s = '';
  for (let i = 0; i < 5; i++) s += ALFABETO[Math.floor(aleatorio() * ALFABETO.length)];
  return `DEP-${s}`;
}
