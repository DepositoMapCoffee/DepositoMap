/**
 * Formateo para la UI (es-CO). Funciones puras, válidas en servidor y cliente.
 */
import type { Fecha, Hora } from '../domain/tiempo';

const COP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

export function formatoPrecio(valor: number): string {
  return COP.format(valor);
}

function aDate(fecha: Fecha): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

const FECHA_LARGA = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const FECHA_CORTA = new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const MES_ANIO = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' });

const mayuscula = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "Jueves, 12 de noviembre" */
export function formatoFechaLarga(fecha: Fecha): string {
  return mayuscula(FECHA_LARGA.format(aDate(fecha)));
}

/** "jue, 12 nov" */
export function formatoFechaCorta(fecha: Fecha): string {
  return FECHA_CORTA.format(aDate(fecha)).replace(/\./g, '');
}

/** "Noviembre de 2026" */
export function formatoMes(mes: string): string {
  return mayuscula(MES_ANIO.format(aDate(`${mes}-01`)));
}

/** "2:00 p. m." */
export function formatoHora(hora: Hora): string {
  const [h, m] = hora.split(':').map(Number);
  const sufijo = h < 12 ? 'a. m.' : 'p. m.';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${sufijo}`;
}

export function formatoDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function pluralPersonas(n: number): string {
  return n === 1 ? '1 persona' : `${n} personas`;
}

/** Fecha/hora local → 'YYYYMMDDTHHMMSS' para calendarios. */
function marcaCalendario(fecha: Fecha, minutosDelDia: number): string {
  const h = String(Math.floor(minutosDelDia / 60)).padStart(2, '0');
  const m = String(minutosDelDia % 60).padStart(2, '0');
  return `${fecha.replace(/-/g, '')}T${h}${m}00`;
}

type EventoCalendario = {
  titulo: string;
  fecha: Fecha;
  hora: Hora;
  duracionMin: number;
  ubicacion: string;
  detalle: string;
  zona: string;
};

function rango(e: EventoCalendario) {
  const [h, m] = e.hora.split(':').map(Number);
  const inicio = h * 60 + m;
  return { inicio: marcaCalendario(e.fecha, inicio), fin: marcaCalendario(e.fecha, inicio + e.duracionMin) };
}

export function enlaceGoogleCalendar(e: EventoCalendario): string {
  const { inicio, fin } = rango(e);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.titulo,
    dates: `${inicio}/${fin}`,
    ctz: e.zona,
    location: e.ubicacion,
    details: e.detalle,
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

export function archivoIcs(e: EventoCalendario & { uid: string }): string {
  const { inicio, fin } = rango(e);
  const esc = (s: string) => s.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//El Deposito//Reservas//ES',
    'BEGIN:VEVENT',
    `UID:${e.uid}@eldeposito`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`,
    `DTSTART;TZID=${e.zona}:${inicio}`,
    `DTEND;TZID=${e.zona}:${fin}`,
    `SUMMARY:${esc(e.titulo)}`,
    `LOCATION:${esc(e.ubicacion)}`,
    `DESCRIPTION:${esc(e.detalle)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
}
