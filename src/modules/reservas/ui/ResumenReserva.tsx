import Image from 'next/image';
import { CalendarDays, Clock3, Globe, Users } from 'lucide-react';
import { cn } from '@/shared/ui';
import type { Fecha, Hora } from '../domain/tiempo';
import type { Experiencia } from '../domain/tipos';
import { formatoDuracion, formatoFechaLarga, formatoHora, formatoPrecio, pluralPersonas } from './formato';

type Props = {
  experiencia: Experiencia | null;
  fecha: Fecha | null;
  hora: Hora | null;
  personas: number;
  idioma: string | null;
  className?: string;
};

/** Tarjeta "Tu reserva" que acompaña todo el flujo. */
export function ResumenReserva({ experiencia, fecha, hora, personas, idioma, className }: Props) {
  const total = experiencia ? experiencia.precio * personas : 0;

  return (
    <div className={cn('rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container overflow-hidden shadow-[var(--shadow-card)]', className)}>
      {experiencia?.imagen ? (
        <div className="relative h-36 bg-surface-high">
          <Image src={experiencia.imagen} alt="" fill sizes="360px" className="object-cover opacity-70 animate-aparecer" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/40 to-transparent" />
          <p className="absolute left-5 bottom-3 text-[11px] uppercase tracking-[0.25em] text-on-surface-soft">Tu reserva</p>
        </div>
      ) : (
        <p className="px-5 pt-5 text-[11px] uppercase tracking-[0.25em] text-on-surface-soft">Tu reserva</p>
      )}

      <div className="p-5 pt-3">
        <h3 className="font-serif text-xl leading-snug text-on-surface">
          {experiencia?.nombre ?? <span className="text-on-surface-muted">Elige una experiencia</span>}
        </h3>
        {experiencia && <p className="text-sm text-on-surface-muted mt-1">{formatoDuracion(experiencia.duracionMin)}</p>}

        <dl className="mt-5 space-y-3 text-sm">
          <Fila icono={<CalendarDays className="w-4 h-4" />} etiqueta="Fecha" valor={fecha ? formatoFechaLarga(fecha) : null} />
          <Fila icono={<Clock3 className="w-4 h-4" />} etiqueta="Hora" valor={hora ? formatoHora(hora) : null} />
          <Fila icono={<Users className="w-4 h-4" />} etiqueta="Personas" valor={pluralPersonas(personas)} />
          <Fila icono={<Globe className="w-4 h-4" />} etiqueta="Idioma" valor={idioma} />
        </dl>

        <div className="mt-5 pt-4 border-t border-outline-soft flex items-end justify-between">
          <div>
            <p className="text-xs text-on-surface-muted">Total</p>
            {experiencia && personas > 1 && (
              <p className="text-xs text-on-surface-muted">
                {formatoPrecio(experiencia.precio)} × {personas}
              </p>
            )}
          </div>
          <p className="font-serif text-2xl text-accent-hover tabular-nums">{experiencia ? formatoPrecio(total) : '—'}</p>
        </div>
      </div>
    </div>
  );
}

function Fila({ icono, etiqueta, valor }: { icono: React.ReactNode; etiqueta: string; valor: string | null }) {
  return (
    <div className="flex items-center gap-3">
      <dt className="flex items-center gap-2 text-on-surface-muted w-24 shrink-0">
        {icono}
        {etiqueta}
      </dt>
      <dd className={cn('text-on-surface truncate', !valor && 'text-on-surface-muted/60')}>{valor ?? 'Por elegir'}</dd>
    </div>
  );
}
