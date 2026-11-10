'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarPlus, Check, Copy, Download, MessageCircle } from 'lucide-react';
import { buttonStyles } from '@/shared/ui';
import { enlaceWhatsApp } from '@/shared/config/negocio';
import type { Fecha, Hora } from '../domain/tiempo';
import type { Experiencia } from '../domain/tipos';
import { archivoIcs, enlaceGoogleCalendar, formatoFechaLarga, formatoHora, formatoPrecio, pluralPersonas } from './formato';

type Props = {
  codigo: string;
  token: string | null;
  experiencia: Experiencia;
  fecha: Fecha;
  hora: Hora;
  personas: number;
  zona: string;
};

export function Confirmacion({ codigo, token, experiencia, fecha, hora, personas, zona }: Props) {
  const [copiado, setCopiado] = useState(false);
  const enlaceGestion = token ? `/reserva/${codigo}?t=${encodeURIComponent(token)}` : null;

  const evento = {
    titulo: `${experiencia.nombre} · ${codigo}`,
    fecha,
    hora,
    duracionMin: experiencia.duracionMin,
    ubicacion: experiencia.ubicacion,
    detalle: `Reserva ${codigo} para ${pluralPersonas(personas)}.`,
    zona,
  };

  const descargarIcs = () => {
    const blob = new Blob([archivoIcs({ ...evento, uid: codigo })], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: `reserva-${codigo}.ics` });
    a.click();
    URL.revokeObjectURL(url);
  };

  const copiarEnlace = async () => {
    if (!enlaceGestion) return;
    try {
      await navigator.clipboard.writeText(new URL(enlaceGestion, window.location.origin).toString());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* el navegador no permite copiar: el enlace sigue visible como botón */
    }
  };

  return (
    <section className="animate-entrar max-w-xl mx-auto text-center py-6" aria-labelledby="titulo-confirmacion">
      <div className="mx-auto w-20 h-20 rounded-full bg-primary-soft grid place-items-center ring-1 ring-primary/30 shadow-[var(--shadow-glow)]">
        <Check className="w-9 h-9 text-primary" strokeWidth={2.5} />
      </div>

      <h2 id="titulo-confirmacion" className="font-serif text-3xl sm:text-4xl mt-6 text-on-surface" tabIndex={-1}>
        ¡Reserva recibida!
      </h2>
      <p className="text-on-surface-soft mt-3 leading-relaxed">
        Te esperamos el <strong className="text-on-surface font-medium">{formatoFechaLarga(fecha).toLowerCase()}</strong> a las{' '}
        <strong className="text-on-surface font-medium">{formatoHora(hora)}</strong> para vivir{' '}
        <em className="font-serif not-italic text-accent-hover">{experiencia.nombre}</em>.
      </p>

      <div className="mt-8 rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-6">
        <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface-muted">Código de reserva</p>
        <p className="font-mono text-3xl sm:text-4xl tracking-[0.15em] text-primary mt-2 select-all">{codigo}</p>
        <p className="text-sm text-on-surface-muted mt-3">
          {pluralPersonas(personas)} · {formatoPrecio(experiencia.precio * personas)}
        </p>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-3">
        <a
          href={enlaceGoogleCalendar(evento)}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles('secondary', 'md', 'w-full')}
        >
          <CalendarPlus className="w-4 h-4" /> Google Calendar
        </a>
        <button type="button" onClick={descargarIcs} className={buttonStyles('secondary', 'md', 'w-full')}>
          <Download className="w-4 h-4" /> Apple / Outlook (.ics)
        </button>
      </div>

      {enlaceGestion && (
        <div className="mt-6 rounded-[var(--radius-lg)] bg-accent-soft border border-accent/25 p-5 text-left">
          <p className="text-sm text-on-surface">
            <strong className="font-medium">Guarda este enlace</strong>: con él puedes ver o cancelar tu reserva.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={enlaceGestion} className={buttonStyles('ghost', 'sm', 'text-accent-hover px-0 underline-offset-4 hover:underline hover:bg-transparent')}>
              Gestionar mi reserva
            </Link>
            <button type="button" onClick={copiarEnlace} className={buttonStyles('ghost', 'sm')}>
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      )}

      <a
        href={enlaceWhatsApp(`Hola, tengo la reserva ${codigo} y quisiera hacer una consulta.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-8 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> ¿Dudas? Escríbenos por WhatsApp
      </a>
    </section>
  );
}
