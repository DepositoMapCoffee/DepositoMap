'use client';

import { Minus, Plus } from 'lucide-react';

type Props = {
  valor: number;
  min: number;
  max: number;
  onCambiar: (valor: number) => void;
  etiqueta: string;
};

/** Selector numérico − / + (táctil y accesible). */
export function Contador({ valor, min, max, onCambiar, etiqueta }: Props) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-surface-low border border-outline-soft p-1" role="group" aria-label={etiqueta}>
      <BotonPaso etiqueta="Quitar una persona" disabled={valor <= min} onClick={() => onCambiar(valor - 1)}>
        <Minus className="w-4 h-4" />
      </BotonPaso>
      <output aria-live="polite" className="w-10 text-center font-serif text-xl text-on-surface tabular-nums">
        {valor}
      </output>
      <BotonPaso etiqueta="Agregar una persona" disabled={valor >= max} onClick={() => onCambiar(valor + 1)}>
        <Plus className="w-4 h-4" />
      </BotonPaso>
    </div>
  );
}

function BotonPaso({
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
      className="w-10 h-10 rounded-full grid place-items-center text-on-surface bg-surface-high hover:bg-primary hover:text-on-primary disabled:opacity-30 disabled:pointer-events-none transition-colors duration-200 cursor-pointer"
    >
      {children}
    </button>
  );
}
