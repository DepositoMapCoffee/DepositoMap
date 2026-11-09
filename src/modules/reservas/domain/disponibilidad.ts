/**
 * Cálculo de disponibilidad (funciones puras, sin BD).
 *
 * Reglas, en orden de prioridad para cada franja:
 *   1. Fuera del rango reservable (pasado o más allá de diasMaxFuturo) → día fuera_de_rango
 *   2. Día o franja bloqueada, o festivo con cerrarFestivos            → bloqueada
 *   3. Faltan menos de anticipacionMinMinutos para empezar              → pasada
 *   4. Sin cupos                                                       → agotada
 *   5. En otro caso                                                    → disponible
 *
 * La capacidad de una franja es compartida por todas las experiencias.
 */
import { esFestivo } from './festivos';
import { diaSemana, diferenciaDias, horaAMinutos, minutosHasta, rangoMes, sumarDias, type Ahora, type Fecha } from './tiempo';
import {
  claveFranja,
  type Ajustes,
  type Bloqueo,
  type DiaCalendario,
  type Franja,
  type Horario,
  type Ocupacion,
} from './tipos';

export type ContextoDisponibilidad = {
  ahora: Ahora;
  ajustes: Ajustes;
  horarios: readonly Horario[];
  bloqueos: readonly Bloqueo[];
  ocupacion: Ocupacion;
};

/** ¿La fecha está dentro de la ventana reservable [hoy, hoy + diasMaxFuturo]? */
export function enRangoReservable(fecha: Fecha, ahora: Ahora, ajustes: Ajustes): boolean {
  const dias = diferenciaDias(ahora.fecha, fecha);
  return dias >= 0 && dias <= ajustes.diasMaxFuturo;
}

function motivoCierreDia(fecha: Fecha, ctx: ContextoDisponibilidad): string | null {
  const bloqueoDia = ctx.bloqueos.find((b) => b.fecha === fecha && b.horaInicio === null);
  if (bloqueoDia) return bloqueoDia.motivo;
  if (ctx.ajustes.cerrarFestivos && esFestivo(fecha)) return 'Festivo';
  return null;
}

/** Franjas de una fecha con su estado. Vacío si ese día no hay horarios. */
export function franjasDelDia(fecha: Fecha, ctx: ContextoDisponibilidad): Franja[] {
  const dia = diaSemana(fecha);
  const delDia = ctx.horarios
    .filter((h) => h.diaSemana === dia)
    .sort((a, b) => horaAMinutos(a.horaInicio) - horaAMinutos(b.horaInicio));

  const cierre = motivoCierreDia(fecha, ctx);

  return delDia.map((h): Franja => {
    const ocupados = ctx.ocupacion.get(claveFranja(fecha, h.horaInicio)) ?? 0;
    const disponibles = Math.max(0, h.capacidad - ocupados);
    const base = { hora: h.horaInicio, capacidad: h.capacidad, ocupados, disponibles };

    if (!enRangoReservable(fecha, ctx.ahora, ctx.ajustes)) {
      return { ...base, disponibles: 0, estado: 'pasada', motivo: 'Fuera del rango de reservas' };
    }
    if (cierre) return { ...base, disponibles: 0, estado: 'bloqueada', motivo: cierre };

    const bloqueoFranja = ctx.bloqueos.find((b) => b.fecha === fecha && b.horaInicio === h.horaInicio);
    if (bloqueoFranja) return { ...base, disponibles: 0, estado: 'bloqueada', motivo: bloqueoFranja.motivo };

    if (minutosHasta(ctx.ahora, fecha, h.horaInicio) < ctx.ajustes.anticipacionMinMinutos) {
      return { ...base, disponibles: 0, estado: 'pasada', motivo: 'Ya no se puede reservar este horario' };
    }
    if (disponibles === 0) return { ...base, estado: 'agotada', motivo: 'Sin cupos' };
    return { ...base, estado: 'disponible' };
  });
}

/** Estado de cada día de un mes 'YYYY-MM' para pintar el calendario. */
export function calendarioMes(mes: string, ctx: ContextoDisponibilidad): DiaCalendario[] {
  const { desde, hasta } = rangoMes(mes);
  const dias: DiaCalendario[] = [];

  for (let fecha = desde; fecha <= hasta; fecha = sumarDias(fecha, 1)) {
    const festivo = esFestivo(fecha);
    if (!enRangoReservable(fecha, ctx.ahora, ctx.ajustes)) {
      dias.push({ fecha, estado: 'fuera_de_rango', cuposLibres: 0, festivo });
      continue;
    }
    const franjas = franjasDelDia(fecha, ctx);
    const reservables = franjas.filter((f) => f.estado === 'disponible' || f.estado === 'agotada');
    const cuposLibres = reservables.reduce((s, f) => s + f.disponibles, 0);

    let estado: DiaCalendario['estado'];
    if (reservables.length === 0) {
      // Sin franjas, todas bloqueadas o todas ya pasadas (p. ej. hoy por la tarde).
      estado = franjas.length > 0 && franjas.every((f) => f.estado === 'pasada') ? 'fuera_de_rango' : 'cerrado';
    } else {
      estado = cuposLibres > 0 ? 'disponible' : 'agotado';
    }
    dias.push({ fecha, estado, cuposLibres, festivo });
  }
  return dias;
}

export type ResultadoVerificacion =
  | { ok: true; franja: Franja }
  | { ok: false; motivo: string };

/** Verifica si se pueden reservar `cupos` en una franja concreta. */
export function verificarFranja(fecha: Fecha, hora: string, cupos: number, ctx: ContextoDisponibilidad): ResultadoVerificacion {
  if (cupos < 1 || cupos > ctx.ajustes.cuposMaxPorReserva) {
    return { ok: false, motivo: `Puedes reservar entre 1 y ${ctx.ajustes.cuposMaxPorReserva} personas.` };
  }
  const franja = franjasDelDia(fecha, ctx).find((f) => f.hora === hora);
  if (!franja) return { ok: false, motivo: 'Ese horario no existe para la fecha elegida.' };
  if (franja.estado !== 'disponible') return { ok: false, motivo: franja.motivo ?? 'Horario no disponible.' };
  if (cupos > franja.disponibles) {
    return {
      ok: false,
      motivo:
        franja.disponibles === 1
          ? 'Solo queda 1 cupo en este horario.'
          : `Solo quedan ${franja.disponibles} cupos en este horario.`,
    };
  }
  return { ok: true, franja };
}
