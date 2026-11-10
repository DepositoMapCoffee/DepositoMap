'use client';

import { useActionState, useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, TextField, cn } from '@/shared/ui';
import { actualizarHorarioAction, crearHorariosAction, eliminarHorarioAction, type EstadoFormAdmin } from '../../actions/admin';
import type { HorarioAdmin } from '../../domain/tipos';
import { formatoHora } from '../formato';
import { MensajeForm } from './MensajeForm';

// Lunes primero (como el calendario).
const DIAS = [
  { n: 1, nombre: 'Lunes' },
  { n: 2, nombre: 'Martes' },
  { n: 3, nombre: 'Miércoles' },
  { n: 4, nombre: 'Jueves' },
  { n: 5, nombre: 'Viernes' },
  { n: 6, nombre: 'Sábado' },
  { n: 0, nombre: 'Domingo' },
];

export function ConfigHorarios({ horarios }: { horarios: HorarioAdmin[] }) {
  const [estado, accion, enviando] = useActionState<EstadoFormAdmin, FormData>(crearHorariosAction, { ok: null });

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
      <div className="space-y-3">
        {DIAS.map((d) => {
          const delDia = horarios.filter((h) => h.diaSemana === d.n);
          return (
            <div key={d.n} className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="w-28 shrink-0 font-medium text-on-surface">{d.nombre}</p>
              {delDia.length === 0 ? (
                <p className="text-sm text-on-surface-muted">Cerrado</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {delDia.map((h) => (
                    <Franja key={h.id} horario={h} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form action={accion} className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-5 space-y-5 h-fit lg:sticky lg:top-24">
        <h3 className="font-serif text-xl text-on-surface">Agregar franja</h3>
        <fieldset>
          <legend className="text-sm font-medium text-on-surface-soft mb-2">Días</legend>
          <div className="grid grid-cols-4 gap-1.5">
            {DIAS.map((d) => (
              <label key={d.n} className="cursor-pointer">
                <input type="checkbox" name="dias" value={d.n} className="peer sr-only" />
                <span className="flex h-9 items-center justify-center rounded-[var(--radius-sm)] border border-outline-soft text-xs text-on-surface-soft peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-on-surface peer-focus-visible:outline-2 peer-focus-visible:outline-focus">
                  {d.nombre.slice(0, 3)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Hora" name="hora" type="time" step={900} required />
          <TextField label="Cupos" name="capacidad" type="number" min={1} max={100} defaultValue={4} required />
        </div>
        <MensajeForm estado={estado} />
        <Button type="submit" loading={enviando} className="w-full">
          Agregar
        </Button>
      </form>
    </div>
  );
}

function Franja({ horario: h }: { horario: HorarioAdmin }) {
  const [pendiente, iniciar] = useTransition();
  const [capacidad, setCapacidad] = useState(h.capacidad);
  const [error, setError] = useState<string | null>(null);
  const [confirmarBorrar, setConfirmarBorrar] = useState(false);

  const ejecutar = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    iniciar(async () => {
      setError(null);
      const r = await fn();
      if (!r.ok) setError(r.error ?? 'Error');
    });

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full border pl-3 pr-1 h-10 text-sm',
        h.activo ? 'border-outline-soft bg-surface-high' : 'border-dashed border-outline-soft opacity-60',
        pendiente && 'opacity-50',
      )}
      title={error ?? undefined}
    >
      <span className="font-medium text-on-surface tabular-nums">{formatoHora(h.horaInicio)}</span>
      <label className="flex items-center gap-1 text-xs text-on-surface-muted">
        <input
          type="number"
          min={1}
          max={100}
          value={capacidad}
          aria-label={`Cupos de las ${formatoHora(h.horaInicio)}`}
          onChange={(e) => setCapacidad(Number(e.target.value))}
          onBlur={() => capacidad !== h.capacidad && ejecutar(() => actualizarHorarioAction(h.id, { capacidad }))}
          className="w-11 bg-transparent text-center text-on-surface border-b border-outline-soft focus:border-primary focus:outline-none"
        />
        cupos
      </label>
      <button
        type="button"
        onClick={() => ejecutar(() => actualizarHorarioAction(h.id, { activo: !h.activo }))}
        className="text-xs px-2 h-7 rounded-full hover:bg-surface-highest text-on-surface-muted hover:text-on-surface cursor-pointer"
      >
        {h.activo ? 'Pausar' : 'Activar'}
      </button>
      {confirmarBorrar ? (
        <button
          type="button"
          onClick={() => ejecutar(() => eliminarHorarioAction(h.id))}
          className="text-xs px-2 h-7 rounded-full bg-danger-soft text-danger cursor-pointer"
          onBlur={() => setConfirmarBorrar(false)}
        >
          ¿Borrar?
        </button>
      ) : (
        <button
          type="button"
          aria-label={`Eliminar franja de las ${formatoHora(h.horaInicio)}`}
          onClick={() => setConfirmarBorrar(true)}
          className="w-7 h-7 grid place-items-center rounded-full text-on-surface-muted hover:text-danger hover:bg-danger-soft cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
      {error && <span className="sr-only" role="alert">{error}</span>}
    </div>
  );
}
