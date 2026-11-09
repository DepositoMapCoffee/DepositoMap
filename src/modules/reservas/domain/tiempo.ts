/**
 * Utilidades de fecha y hora "de pared" del negocio.
 *
 * Las reservas trabajan con fechas 'YYYY-MM-DD' y horas 'HH:MM' en la zona
 * horaria del local (America/Bogota). Toda la aritmética se hace en UTC
 * sobre esas cadenas para no depender de la zona horaria del servidor
 * (Vercel corre en UTC; un VPS puede tener cualquier otra).
 */

export type Fecha = string; // 'YYYY-MM-DD'
export type Hora = string; // 'HH:MM'

/** Momento actual expresado en la zona del negocio. */
export type Ahora = { fecha: Fecha; minutos: number };

const RE_FECHA = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const RE_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

export function esFechaValida(valor: string): valor is Fecha {
  if (!RE_FECHA.test(valor)) return false;
  return aIso(desdeIso(valor)) === valor; // descarta 2026-02-30
}

export function esHoraValida(valor: string): valor is Hora {
  return RE_HORA.test(valor);
}

function desdeIso(fecha: Fecha): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function aIso(date: Date): Fecha {
  return date.toISOString().slice(0, 10);
}

export function sumarDias(fecha: Fecha, dias: number): Fecha {
  const d = desdeIso(fecha);
  d.setUTCDate(d.getUTCDate() + dias);
  return aIso(d);
}

/** Días entre dos fechas (b - a). */
export function diferenciaDias(a: Fecha, b: Fecha): number {
  return Math.round((desdeIso(b).getTime() - desdeIso(a).getTime()) / 86_400_000);
}

/** 0 = domingo … 6 = sábado. */
export function diaSemana(fecha: Fecha): number {
  return desdeIso(fecha).getUTCDay();
}

export function horaAMinutos(hora: Hora): number {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + m;
}

export function minutosAHora(minutos: number): Hora {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Minutos que faltan desde `ahora` hasta `fecha hora` (negativo si ya pasó). */
export function minutosHasta(ahora: Ahora, fecha: Fecha, hora: Hora): number {
  return diferenciaDias(ahora.fecha, fecha) * 1440 + horaAMinutos(hora) - ahora.minutos;
}

/** Convierte un instante real en fecha/minutos de la zona del negocio. */
export function ahoraEnZona(zona: string, instante: Date = new Date()): Ahora {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instante);
  const v = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '00';
  return {
    fecha: `${v('year')}-${v('month')}-${v('day')}`,
    minutos: Number(v('hour')) * 60 + Number(v('minute')),
  };
}

/** Primer y último día de un mes 'YYYY-MM'. */
export function rangoMes(mes: string): { desde: Fecha; hasta: Fecha } {
  const desde = `${mes}-01`;
  const hasta = sumarDias(aIso(new Date(Date.UTC(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 1))), -1);
  return { desde, hasta };
}

export function esMesValido(valor: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(valor);
}
