/**
 * Maqueta base de los correos de El Depósito.
 *
 * Reglas de compatibilidad (Gmail, Outlook, Apple Mail):
 *  - Tablas y estilos en línea; nada de CSS externo, flex ni grid.
 *  - Sin SVG ni fuentes web: serif = Georgia, sans = Helvetica/Arial.
 *  - Fondo claro (crema) para que se lea igual en modo claro y oscuro.
 *  - Todo texto variable pasa por `esc()` (evita inyectar HTML).
 */
import { NEGOCIO, enlaceWhatsApp } from '@/shared/config/negocio';

export const COLORES = {
  fondo: '#f4f1ec',
  tarjeta: '#ffffff',
  tinta: '#1a1a1a',
  suave: '#5f5a52',
  linea: '#e6e0d6',
  negro: '#0A0A0A',
  crema: '#F5F0E6',
  verde: '#267a52',
  marron: '#955a23',
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Helvetica, Arial, sans-serif";

/** Escapa texto para insertarlo en HTML. */
export function esc(texto: string | number | null | undefined): string {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type Fila = [etiqueta: string, valor: string];

/** Tabla de detalles etiqueta → valor. */
export function tablaDetalles(filas: Fila[]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px">
${filas
  .map(
    ([e, v]) => `<tr>
  <td style="padding:10px 0;border-bottom:1px solid ${COLORES.linea};font:13px ${SANS};color:${COLORES.suave};width:38%;vertical-align:top">${esc(e)}</td>
  <td style="padding:10px 0;border-bottom:1px solid ${COLORES.linea};font:15px ${SANS};color:${COLORES.tinta};vertical-align:top">${esc(v)}</td>
</tr>`,
  )
  .join('\n')}
</table>`;
}

/** Botón principal (tabla + enlace, compatible con Outlook). */
export function boton(texto: string, url: string, color: string = COLORES.verde): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px"><tr>
<td style="border-radius:10px;background:${color}">
<a href="${esc(url)}" style="display:inline-block;padding:14px 26px;font:bold 15px ${SANS};color:#ffffff;text-decoration:none;border-radius:10px">${esc(texto)}</a>
</td></tr></table>`;
}

/** Caja destacada con el código de reserva. */
export function cajaCodigo(codigo: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0"><tr>
<td style="background:${COLORES.fondo};border-radius:12px;padding:18px;text-align:center">
<div style="font:11px ${SANS};letter-spacing:3px;text-transform:uppercase;color:${COLORES.suave}">Código de reserva</div>
<div style="font:bold 26px 'Courier New',monospace;letter-spacing:4px;color:${COLORES.verde};margin-top:6px">${esc(codigo)}</div>
</td></tr></table>`;
}

export function parrafo(html: string): string {
  return `<p style="margin:0 0 14px;font:15px/1.6 ${SANS};color:${COLORES.tinta}">${html}</p>`;
}

export function notaSuave(html: string): string {
  return `<p style="margin:16px 0 0;font:13px/1.6 ${SANS};color:${COLORES.suave}">${html}</p>`;
}

type Maqueta = {
  /** Texto oculto que se ve como vista previa en la bandeja de entrada. */
  previa: string;
  titulo: string;
  cuerpo: string;
};

export function maqueta({ previa, titulo, cuerpo }: Maqueta): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light"><title>${esc(titulo)}</title></head>
<body style="margin:0;padding:0;background:${COLORES.fondo}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(previa)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORES.fondo}"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
  <tr><td style="background:${COLORES.negro};border-radius:16px 16px 0 0;padding:26px 32px">
    <div style="font:24px ${SERIF};color:${COLORES.crema}">El Depósito</div>
    <div style="font:11px ${SANS};letter-spacing:3px;text-transform:uppercase;color:#c8925a;margin-top:6px">Coffee Tasting · ${esc(NEGOCIO.ciudad)}</div>
  </td></tr>
  <tr><td style="background:${COLORES.tarjeta};padding:32px;border-radius:0 0 16px 16px">
    <h1 style="margin:0 0 18px;font:normal 26px/1.25 ${SERIF};color:${COLORES.tinta}">${esc(titulo)}</h1>
    ${cuerpo}
  </td></tr>
  <tr><td style="padding:22px 32px;text-align:center;font:12px/1.7 ${SANS};color:${COLORES.suave}">
    ${esc(NEGOCIO.nombre)} · ${esc(NEGOCIO.direccion)}, ${esc(NEGOCIO.ciudad)}<br>
    <a href="${esc(enlaceWhatsApp())}" style="color:${COLORES.verde}">Escríbenos por WhatsApp</a>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
