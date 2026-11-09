'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock3, Globe, MapPin, MessageCircle, Users } from 'lucide-react';
import { Badge, Button, type BadgeTone } from '@/shared/ui';
import { enlaceWhatsApp } from '@/shared/config/negocio';
import { cancelarReserva } from '../actions/publicas';
import { ETIQUETAS_ESTADO, type ResultadoCancelacion } from '../domain/reglas';
import type { EstadoReserva, ReservaPublica } from '../domain/tipos';
import { formatoDuracion, formatoFechaLarga, formatoHora, formatoPrecio, pluralPersonas } from './formato';

const TONO: Record<EstadoReserva, BadgeTone> = {
  pendiente: 'warning',
  confirmada: 'primary',
  completada: 'neutral',
  cancelada: 'danger',
  no_show: 'neutral',
};

type Props = {
  reserva: ReservaPublica;
  token: string;
  cancelable: ResultadoCancelacion;
};

export function GestionReserva({ reserva, token, cancelable }: Props) {
  const [estado, setEstado] = useState<EstadoReserva>(reserva.estado);
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelando, iniciar] = useTransition();
  const sePuedeCancelar = cancelable.ok && estado !== 'cancelada';

  const cancelar = () => {
    setError(null);
    iniciar(async () => {
      const r = await cancelarReserva(reserva.codigo, token);
      if (r.ok) {
        setEstado('cancelada');
        setConfirmando(false);
      } else {
        setError(r.motivo);
      }
    });
  };

  return (
    <article className="animate-entrar max-w-2xl mx-auto">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-on-surface-muted">Reserva</p>
          <h1 className="font-mono text-3xl sm:text-4xl tracking-[0.12em] text-primary mt-1">{reserva.codigo}</h1>
        </div>
        <Badge tone={TONO[estado]} className="text-sm px-3 py-1" aria-live="polite">
          {ETIQUETAS_ESTADO[estado]}
        </Badge>
      </header>

      <div className="mt-8 rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-6 sm:p-8 shadow-[var(--shadow-card)]">
        <h2 className="font-serif text-2xl text-on-surface">{reserva.experiencia.nombre}</h2>
        <p className="text-sm text-on-surface-muted mt-1">A nombre de {reserva.nombre}</p>

        <dl className="mt-6 grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Dato icono={<CalendarDays className="w-4 h-4" />} etiqueta="Fecha" valor={formatoFechaLarga(reserva.fecha)} />
          <Dato
            icono={<Clock3 className="w-4 h-4" />}
            etiqueta="Hora"
            valor={`${formatoHora(reserva.horaInicio)} · ${formatoDuracion(reserva.experiencia.duracionMin)}`}
          />
          <Dato icono={<Users className="w-4 h-4" />} etiqueta="Personas" valor={pluralPersonas(reserva.cupos)} />
          <Dato icono={<Globe className="w-4 h-4" />} etiqueta="Idioma" valor={reserva.idioma} />
          <div className="sm:col-span-2">
            <Dato icono={<MapPin className="w-4 h-4" />} etiqueta="Lugar" valor={reserva.experiencia.ubicacion} />
          </div>
        </dl>

        <div className="mt-6 pt-5 border-t border-outline-soft flex items-center justify-between">
          <span className="text-sm text-on-surface-muted">Total</span>
          <span className="font-serif text-2xl text-accent-hover tabular-nums">
            {formatoPrecio(reserva.precioUnitario * reserva.cupos)}
          </span>
        </div>
      </div>

      {estado === 'cancelada' ? (
        <p className="mt-6 text-sm text-on-surface-muted text-center">
          Esta reserva está cancelada. Si fue un error,{' '}
          <Link href="/reservar" className="text-primary hover:underline underline-offset-2">
            haz una nueva reserva
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          {sePuedeCancelar ? (
            confirmando ? (
              <div className="rounded-[var(--radius-lg)] border border-danger/30 bg-danger-soft p-5">
                <p className="text-sm text-on-surface">¿Seguro que quieres cancelar? Liberaremos tus cupos para otras personas.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="danger" onClick={cancelar} loading={cancelando}>
                    Sí, cancelar reserva
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmando(false)} disabled={cancelando}>
                    No, mantenerla
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setConfirmando(true)}>
                Cancelar reserva
              </Button>
            )
          ) : (
            !cancelable.ok && <p className="text-sm text-on-surface-muted">{cancelable.motivo}</p>
          )}
        </div>
      )}

      <a
        href={enlaceWhatsApp(`Hola, tengo la reserva ${reserva.codigo} y quisiera hacer una consulta.`)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-10 inline-flex items-center gap-2 text-sm text-on-surface-muted hover:text-on-surface transition-colors"
      >
        <MessageCircle className="w-4 h-4" /> ¿Necesitas cambiar algo? Escríbenos por WhatsApp
      </a>
    </article>
  );
}

function Dato({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-on-surface-muted">
        {icono}
        {etiqueta}
      </dt>
      <dd className="text-on-surface mt-1">{valor}</dd>
    </div>
  );
}
