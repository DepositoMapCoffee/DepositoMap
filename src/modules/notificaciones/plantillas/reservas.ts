/**
 * Mensajes de correo sobre reservas. Funciones puras: reciben los datos y
 * devuelven asunto, HTML, texto plano y adjuntos. Fáciles de probar y de
 * reutilizar para otros canales (el texto plano sirve para WhatsApp).
 */
import {
  archivoIcs,
  formatoDuracion,
  formatoFechaLarga,
  formatoHora,
  formatoPrecio,
  pluralPersonas,
  type ReservaParaNotificar,
} from '@/modules/reservas';
import type { Adjunto } from '@/shared/infra/correo';
import { boton, cajaCodigo, COLORES, esc, maqueta, notaSuave, parrafo, tablaDetalles, type Fila } from './base';

export type Mensaje = { asunto: string; html: string; texto: string; adjuntos?: Adjunto[] };

const primerNombre = (r: ReservaParaNotificar) => r.nombre.trim().split(/\s+/)[0];
const cuando = (r: ReservaParaNotificar) => `${formatoFechaLarga(r.fecha)} · ${formatoHora(r.horaInicio)}`;
/** "el miércoles, 11 de noviembre a las 2:00 p. m." (para usar dentro de una frase). */
const enFrase = (r: ReservaParaNotificar) =>
  `el ${formatoFechaLarga(r.fecha).toLowerCase()} a las ${formatoHora(r.horaInicio)}`;
const total = (r: ReservaParaNotificar) => formatoPrecio(r.precioUnitario * r.cupos);

function filas(r: ReservaParaNotificar): Fila[] {
  return [
    ['Experiencia', r.experiencia.nombre],
    ['Fecha', formatoFechaLarga(r.fecha)],
    ['Hora', `${formatoHora(r.horaInicio)} (${formatoDuracion(r.experiencia.duracionMin)})`],
    ['Personas', pluralPersonas(r.cupos)],
    ['Idioma', r.idioma],
    ['Lugar', r.experiencia.ubicacion],
    ['Total', total(r)],
  ];
}

function textoDetalles(r: ReservaParaNotificar): string {
  return filas(r)
    .map(([e, v]) => `${e}: ${v}`)
    .join('\n');
}

function adjuntoCalendario(r: ReservaParaNotificar, zona: string): Adjunto {
  return {
    nombre: `reserva-${r.codigo}.ics`,
    tipo: 'text/calendar; charset=utf-8; method=PUBLISH',
    contenido: archivoIcs({
      uid: r.codigo,
      titulo: `${r.experiencia.nombre} · ${r.codigo}`,
      fecha: r.fecha,
      hora: r.horaInicio,
      duracionMin: r.experiencia.duracionMin,
      ubicacion: r.experiencia.ubicacion,
      detalle: `Reserva ${r.codigo} para ${pluralPersonas(r.cupos)}. Gestionar: ${r.enlaceGestion}`,
      zona,
    }),
  };
}

/** Al crear una reserva pendiente (web, bot o manual sin confirmar). */
export function reservaRecibida(r: ReservaParaNotificar, zona: string): Mensaje {
  const titulo = `¡Reserva recibida, ${primerNombre(r)}!`;
  return {
    asunto: `Recibimos tu reserva ${r.codigo} · ${r.experiencia.nombre}`,
    html: maqueta({
      previa: `Tu lugar para ${enFrase(r)} está apartado.`,
      titulo,
      cuerpo: [
        parrafo(`Tu lugar está apartado para el <strong>${esc(formatoFechaLarga(r.fecha).toLowerCase())}</strong> a las <strong>${esc(formatoHora(r.horaInicio))}</strong>. Te avisaremos por correo cuando la confirmemos.`),
        cajaCodigo(r.codigo),
        tablaDetalles(filas(r)),
        boton('Ver o cancelar mi reserva', r.enlaceGestion),
        notaSuave('Adjuntamos el evento para tu calendario. Si necesitas cambiar algo, responde este correo o escríbenos por WhatsApp.'),
      ].join('\n'),
    }),
    texto: `${titulo}\n\nTu lugar está apartado. Te avisaremos cuando la confirmemos.\n\nCódigo: ${r.codigo}\n${textoDetalles(r)}\n\nVer o cancelar: ${r.enlaceGestion}`,
    adjuntos: [adjuntoCalendario(r, zona)],
  };
}

/** Cuando el equipo confirma la reserva (o se registra ya confirmada). */
export function reservaConfirmada(r: ReservaParaNotificar, zona: string): Mensaje {
  const titulo = 'Tu reserva está confirmada';
  return {
    asunto: `Confirmada: ${r.experiencia.nombre} · ${cuando(r)}`,
    html: maqueta({
      previa: `Te esperamos ${enFrase(r)}`,
      titulo,
      cuerpo: [
        parrafo(`${esc(primerNombre(r))}, te esperamos el <strong>${esc(formatoFechaLarga(r.fecha).toLowerCase())}</strong> a las <strong>${esc(formatoHora(r.horaInicio))}</strong>. Llega unos minutos antes para empezar a tiempo.`),
        cajaCodigo(r.codigo),
        tablaDetalles(filas(r)),
        boton('Ver mi reserva', r.enlaceGestion),
      ].join('\n'),
    }),
    texto: `${titulo}\n\nTe esperamos ${enFrase(r)}\n\nCódigo: ${r.codigo}\n${textoDetalles(r)}\n\nVer o cancelar: ${r.enlaceGestion}`,
    adjuntos: [adjuntoCalendario(r, zona)],
  };
}

/** Recordatorio el día anterior. */
export function recordatorio(r: ReservaParaNotificar): Mensaje {
  const titulo = `Mañana te esperamos, ${primerNombre(r)}`;
  const mapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.experiencia.ubicacion + ', Cartagena')}`;
  return {
    asunto: `Mañana: ${r.experiencia.nombre} a las ${formatoHora(r.horaInicio)}`,
    html: maqueta({
      previa: `Tu Coffee Tasting es mañana a las ${formatoHora(r.horaInicio)}.`,
      titulo,
      cuerpo: [
        parrafo(`Te recordamos tu experiencia de mañana, <strong>${esc(formatoFechaLarga(r.fecha).toLowerCase())}</strong>, a las <strong>${esc(formatoHora(r.horaInicio))}</strong>.`),
        tablaDetalles(filas(r)),
        boton('Cómo llegar', mapa, COLORES.marron),
        notaSuave(`¿No puedes asistir? <a href="${esc(r.enlaceGestion)}" style="color:${COLORES.verde}">Gestiona tu reserva</a> o escríbenos para liberar el cupo.`),
      ].join('\n'),
    }),
    texto: `${titulo}\n\nTu experiencia es mañana, ${formatoFechaLarga(r.fecha).toLowerCase()}, a las ${formatoHora(r.horaInicio)}\n\n${textoDetalles(r)}\n\nCómo llegar: ${mapa}\nGestionar: ${r.enlaceGestion}`,
  };
}

/** Cuando la reserva se cancela (por el cliente o por el equipo). */
export function reservaCancelada(r: ReservaParaNotificar, porCliente: boolean, urlReservar: string): Mensaje {
  const titulo = 'Tu reserva fue cancelada';
  const motivo = porCliente
    ? 'Confirmamos la cancelación que hiciste. Los cupos quedaron libres.'
    : 'Tuvimos que cancelar tu reserva. Si quieres, escríbenos y te ayudamos a elegir otra fecha.';
  return {
    asunto: `Cancelada: reserva ${r.codigo}`,
    html: maqueta({
      previa: `Reserva ${r.codigo} del ${cuando(r)} cancelada.`,
      titulo,
      cuerpo: [
        parrafo(esc(motivo)),
        tablaDetalles([
          ['Código', r.codigo],
          ['Experiencia', r.experiencia.nombre],
          ['Fecha', `${formatoFechaLarga(r.fecha)} · ${formatoHora(r.horaInicio)}`],
          ['Personas', pluralPersonas(r.cupos)],
        ]),
        boton('Reservar otra fecha', urlReservar),
      ].join('\n'),
    }),
    texto: `${titulo}\n\n${motivo}\n\nCódigo: ${r.codigo}\n${r.experiencia.nombre} · ${cuando(r)} · ${pluralPersonas(r.cupos)}\n\nReservar otra fecha: ${urlReservar}`,
  };
}

/** Aviso interno al equipo (reserva nueva o cancelada por el cliente). */
export function avisoNegocio(r: ReservaParaNotificar, tipo: 'nueva' | 'cancelada', urlAgenda: string): Mensaje {
  const titulo = tipo === 'nueva' ? 'Nueva reserva' : 'Reserva cancelada por el cliente';
  const resumen = `${r.codigo} · ${r.nombre} · ${pluralPersonas(r.cupos)} · ${formatoFechaLarga(r.fecha)} ${formatoHora(r.horaInicio)}`;
  return {
    asunto: `${tipo === 'nueva' ? '🟢 Nueva' : '🔴 Cancelada'}: ${resumen}`,
    html: maqueta({
      previa: resumen,
      titulo,
      cuerpo: [
        tablaDetalles([
          ['Código', r.codigo],
          ['Cliente', r.nombre],
          ['Teléfono', r.telefono],
          ['Correo', r.email ?? '—'],
          ...filas(r).filter(([e]) => e !== 'Lugar'),
          ['Canal', r.canal],
          ...(r.notas ? ([['Notas', r.notas]] as Fila[]) : []),
        ]),
        boton(tipo === 'nueva' ? 'Abrir en la agenda' : 'Ver agenda', urlAgenda),
      ].join('\n'),
    }),
    texto: `${titulo}\n\n${resumen}\nTeléfono: ${r.telefono}\nCorreo: ${r.email ?? '—'}\nCanal: ${r.canal}${r.notas ? `\nNotas: ${r.notas}` : ''}\n\nAgenda: ${urlAgenda}`,
  };
}
