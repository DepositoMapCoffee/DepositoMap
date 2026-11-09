'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/ui';
import { diaSemana, type Fecha } from '../domain/tiempo';
import type { DiaCalendario } from '../domain/tipos';
import { formatoFechaLarga, formatoMes } from './formato';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

type Props = {
  mes: string;
  dias: DiaCalendario[];
  seleccionada: Fecha | null;
  cargando: boolean;
  puedeRetroceder: boolean;
  puedeAvanzar: boolean;
  onCambiarMes: (delta: -1 | 1) => void;
  onSeleccionar: (fecha: Fecha) => void;
};

/**
 * Calendario mensual accesible (botones nativos, lunes primero).
 * Los días sin disponibilidad se muestran pero no se pueden elegir.
 */
export function Calendario({
  mes,
  dias,
  seleccionada,
  cargando,
  puedeRetroceder,
  puedeAvanzar,
  onCambiarMes,
  onSeleccionar,
}: Props) {
  // Huecos antes del día 1 (lunes = 0).
  const desfase = dias.length ? (diaSemana(dias[0].fecha) + 6) % 7 : 0;

  return (
    <div className="select-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-on-surface" aria-live="polite">
          {formatoMes(mes)}
        </h3>
        <div className="flex gap-1">
          <BotonMes etiqueta="Mes anterior" disabled={!puedeRetroceder || cargando} onClick={() => onCambiarMes(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </BotonMes>
          <BotonMes etiqueta="Mes siguiente" disabled={!puedeAvanzar || cargando} onClick={() => onCambiarMes(1)}>
            <ChevronRight className="w-5 h-5" />
          </BotonMes>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1" aria-hidden="true">
        {DIAS.map((d) => (
          <div key={d} className="text-center text-[11px] uppercase tracking-wider text-on-surface-muted py-1">
            {d}
          </div>
        ))}
      </div>

      <div
        role="group"
        aria-label={`Días de ${formatoMes(mes)}`}
        aria-busy={cargando}
        className={cn('grid grid-cols-7 gap-1 transition-opacity duration-200', cargando && 'opacity-40 pointer-events-none')}
      >
        {Array.from({ length: desfase }, (_, i) => (
          <div key={`hueco-${i}`} />
        ))}
        {dias.map((d) => {
          const elegible = d.estado === 'disponible';
          const activa = d.fecha === seleccionada;
          const pocos = elegible && d.cuposLibres <= 3;
          const numero = Number(d.fecha.slice(8));
          return (
            <button
              key={d.fecha}
              type="button"
              disabled={!elegible}
              aria-pressed={activa}
              aria-label={`${formatoFechaLarga(d.fecha)}${etiquetaEstado(d)}`}
              onClick={() => onSeleccionar(d.fecha)}
              className={cn(
                'relative aspect-square rounded-[var(--radius-md)] text-[15px] font-medium',
                'flex flex-col items-center justify-center gap-0.5',
                'transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-soft)]',
                activa && 'bg-primary text-on-primary shadow-[var(--shadow-glow)] scale-[1.04]',
                !activa && elegible && 'text-on-surface bg-surface-high/60 hover:bg-surface-highest hover:text-primary-hover cursor-pointer',
                !activa && d.estado === 'agotado' && 'text-on-surface-muted/70 line-through decoration-on-surface-muted/50',
                !activa && (d.estado === 'cerrado' || d.estado === 'fuera_de_rango') && 'text-on-surface-muted/35',
              )}
            >
              {numero}
              {elegible && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'w-1 h-1 rounded-full',
                    activa ? 'bg-on-primary/70' : pocos ? 'bg-accent-hover' : 'bg-primary',
                  )}
                />
              )}
              {d.festivo && !activa && (
                <span aria-hidden="true" className="absolute top-1 right-1.5 text-[9px] text-accent-hover">
                  •
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-xs text-on-surface-muted">
        <Leyenda color="bg-primary">Disponible</Leyenda>
        <Leyenda color="bg-accent-hover">Últimos cupos</Leyenda>
        <li className="flex items-center gap-1.5">
          <span className="line-through">12</span> Agotado
        </li>
      </ul>
    </div>
  );
}

function etiquetaEstado(d: DiaCalendario): string {
  switch (d.estado) {
    case 'disponible':
      return d.cuposLibres <= 3 ? ', últimos cupos' : ', disponible';
    case 'agotado':
      return ', agotado';
    case 'cerrado':
      return ', cerrado';
    default:
      return ', no disponible';
  }
}

function BotonMes({
  etiqueta,
  disabled,
  onClick,
  children,
}: {
  etiqueta: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      disabled={disabled}
      onClick={onClick}
      className="w-10 h-10 rounded-full grid place-items-center text-on-surface-soft hover:bg-surface-high hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
    >
      {children}
    </button>
  );
}

function Leyenda({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn('w-1.5 h-1.5 rounded-full', color)} aria-hidden="true" />
      {children}
    </li>
  );
}
