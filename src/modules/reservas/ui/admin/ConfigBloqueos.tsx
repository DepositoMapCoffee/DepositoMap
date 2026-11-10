'use client';

import { useActionState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { Button, TextField } from '@/shared/ui';
import { crearBloqueoAction, eliminarBloqueoAction, type EstadoFormAdmin } from '../../actions/admin';
import type { BloqueoAdmin } from '../../domain/tipos';
import { formatoFechaLarga, formatoHora } from '../formato';
import { MensajeForm } from './MensajeForm';

export function ConfigBloqueos({ bloqueos, hoy }: { bloqueos: BloqueoAdmin[]; hoy: string }) {
  const [estado, accion, enviando] = useActionState<EstadoFormAdmin, FormData>(crearBloqueoAction, { ok: null });
  const [borrando, iniciar] = useTransition();

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-8">
      <div>
        {bloqueos.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-outline-soft p-8 text-center text-on-surface-muted">
            No hay cierres programados.
          </p>
        ) : (
          <ul className="space-y-2">
            {bloqueos.map((b) => (
              <li key={b.id} className="flex items-center gap-4 rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-on-surface">{formatoFechaLarga(b.fecha)}</p>
                  <p className="text-sm text-on-surface-muted">
                    {b.horaInicio ? `Solo ${formatoHora(b.horaInicio)}` : 'Todo el día'} · {b.motivo}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={borrando}
                  onClick={() => iniciar(async () => void (await eliminarBloqueoAction(b.id)))}
                  aria-label="Quitar cierre"
                  className="w-9 h-9 grid place-items-center rounded-full text-on-surface-muted hover:text-danger hover:bg-danger-soft cursor-pointer disabled:opacity-40"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <form action={accion} className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-5 space-y-5 h-fit lg:sticky lg:top-24">
        <h3 className="font-serif text-xl text-on-surface">Cerrar un día u horario</h3>
        <TextField label="Fecha" name="fecha" type="date" min={hoy} required />
        <TextField label="Hora (vacío = todo el día)" name="hora" type="time" step={900} />
        <TextField label="Motivo" name="motivo" placeholder="Inventario, evento privado…" required />
        <MensajeForm estado={estado} />
        <Button type="submit" loading={enviando} className="w-full">
          Crear cierre
        </Button>
      </form>
    </div>
  );
}
