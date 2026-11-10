'use client';

import { useState } from 'react';
import { ChevronDown, Heart, Mountain, Percent, Sprout, Weight } from 'lucide-react';
import { Badge, cn } from '@/shared/ui';
import type { Producto } from '../domain/tipos';

type Props = {
  producto: Producto;
  favorito: boolean;
  onFavorito: () => void;
  pendiente?: boolean;
};

/** Ficha de un café o chocolate en el mapa de orígenes. */
export function TarjetaProducto({ producto: p, favorito, onFavorito, pendiente }: Props) {
  const [abierta, setAbierta] = useState(false);
  const esChocolate = p.tipo === 'chocolate';
  const notas = (p.notas ?? '').split(/[,·]/).map((n) => n.trim()).filter(Boolean).slice(0, 5);
  const tieneDetalle = Boolean(p.descripcionLarga || p.metodoSugerido || p.preparacion || p.sugerencias);

  return (
    <article className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-5 sm:p-6 transition-[border-color] hover:border-outline">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-3">
            <Badge tone={esChocolate ? 'accent' : 'primary'}>{esChocolate ? 'Chocolate' : 'Café'}</Badge>
            {!esChocolate && p.categoria && <Badge>{p.categoria}</Badge>}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl leading-snug text-on-surface">{p.nombre}</h3>
        </div>
        <button
          type="button"
          onClick={onFavorito}
          disabled={pendiente}
          aria-pressed={favorito}
          aria-label={favorito ? `Quitar ${p.nombre} de favoritos` : `Guardar ${p.nombre} en favoritos`}
          className={cn(
            'w-10 h-10 shrink-0 grid place-items-center rounded-full transition-colors cursor-pointer disabled:opacity-50',
            favorito ? 'text-danger bg-danger-soft' : 'text-on-surface-muted hover:text-danger hover:bg-danger-soft',
          )}
        >
          <Heart className={cn('w-5 h-5', favorito && 'fill-current')} />
        </button>
      </div>

      <dl className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-on-surface-soft">
        {p.finca && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">Finca</dt>
            <Sprout className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
            <dd>{p.finca}</dd>
          </div>
        )}
        {p.altura && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{esChocolate ? 'Presentación' : 'Altura'}</dt>
            {esChocolate ? (
              <Weight className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
            ) : (
              <Mountain className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
            )}
            <dd>{p.altura}</dd>
          </div>
        )}
        {p.proceso && (
          <div className="flex items-center gap-1.5">
            <dt className="sr-only">{esChocolate ? 'Cacao' : 'Proceso'}</dt>
            <Percent className="w-4 h-4 text-on-surface-muted" aria-hidden="true" />
            <dd>{p.proceso}</dd>
          </div>
        )}
      </dl>

      {notas.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={esChocolate ? 'Notas de sabor' : 'Notas de cata'}>
          {notas.map((n) => (
            <li key={n} className="rounded-full bg-accent-soft text-accent-hover border border-accent/20 px-3 py-1 text-xs">
              {n}
            </li>
          ))}
        </ul>
      )}

      {tieneDetalle && (
        <>
          <button
            type="button"
            onClick={() => setAbierta((a) => !a)}
            aria-expanded={abierta}
            className="mt-5 inline-flex items-center gap-1 text-sm text-primary hover:text-primary-hover cursor-pointer"
          >
            {abierta ? 'Ocultar detalles' : 'Ver historia y preparación'}
            <ChevronDown className={cn('w-4 h-4 transition-transform', abierta && 'rotate-180')} />
          </button>
          {abierta && (
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-on-surface-soft animate-aparecer">
              {p.descripcionLarga && <p>{p.descripcionLarga}</p>}
              {(p.metodoSugerido || p.preparacion) && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted mb-1">Preparación</p>
                  {p.metodoSugerido && <p className="text-on-surface">{p.metodoSugerido}</p>}
                  {p.preparacion && <p>{p.preparacion}</p>}
                </div>
              )}
              {p.sugerencias && (
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-on-surface-muted mb-1">Sugerencias del tostador</p>
                  <p>{p.sugerencias}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
