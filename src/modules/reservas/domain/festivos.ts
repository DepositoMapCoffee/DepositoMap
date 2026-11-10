/**
 * Festivos de Colombia (Ley 51 de 1983, "Ley Emiliani").
 *
 *  - Fijos: no se trasladan.
 *  - Trasladables: si no caen lunes, pasan al lunes siguiente.
 *  - Religiosos móviles: dependen del Domingo de Pascua.
 */
import { diaSemana, sumarDias, type Fecha } from './tiempo';

const FIJOS = ['01-01', '05-01', '07-20', '08-07', '12-08', '12-25'];
const TRASLADABLES = ['01-06', '03-19', '06-29', '08-15', '10-12', '11-01', '11-11'];

/** Domingo de Pascua (algoritmo anónimo gregoriano / Meeus). */
export function domingoDePascua(anio: number): Fecha {
  const a = anio % 19;
  const b = Math.floor(anio / 100);
  const c = anio % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

/** Traslada al lunes siguiente si la fecha no es lunes. */
function alLunes(fecha: Fecha): Fecha {
  const dia = diaSemana(fecha); // 1 = lunes
  return dia === 1 ? fecha : sumarDias(fecha, (8 - dia) % 7);
}

const cache = new Map<number, Set<Fecha>>();

export function festivosColombia(anio: number): Set<Fecha> {
  const enCache = cache.get(anio);
  if (enCache) return enCache;

  const pascua = domingoDePascua(anio);
  const festivos = new Set<Fecha>([
    ...FIJOS.map((md) => `${anio}-${md}`),
    ...TRASLADABLES.map((md) => alLunes(`${anio}-${md}`)),
    sumarDias(pascua, -3), // Jueves Santo
    sumarDias(pascua, -2), // Viernes Santo
    alLunes(sumarDias(pascua, 39)), // Ascensión del Señor
    alLunes(sumarDias(pascua, 60)), // Corpus Christi
    alLunes(sumarDias(pascua, 68)), // Sagrado Corazón
  ]);
  cache.set(anio, festivos);
  return festivos;
}

export function esFestivo(fecha: Fecha): boolean {
  return festivosColombia(Number(fecha.slice(0, 4))).has(fecha);
}
