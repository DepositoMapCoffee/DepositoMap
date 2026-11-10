'use client';

import { useActionState } from 'react';
import { Button, TextField } from '@/shared/ui';
import { guardarAjustesAction, type EstadoFormAdmin } from '../../actions/admin';
import type { Ajustes } from '../../domain/tipos';
import { MensajeForm } from './MensajeForm';

export function ConfigAjustes({ ajustes: a }: { ajustes: Ajustes }) {
  const [estado, accion, enviando] = useActionState<EstadoFormAdmin, FormData>(guardarAjustesAction, { ok: null });

  return (
    <form action={accion} className="max-w-2xl space-y-6">
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField
          label="Anticipación mínima (minutos)"
          name="anticipacionMinMinutos"
          type="number"
          min={0}
          defaultValue={a.anticipacionMinMinutos}
          hint="Cuánto antes de la sesión se puede reservar en línea. 120 = 2 horas."
        />
        <TextField
          label="Reservar hasta (días)"
          name="diasMaxFuturo"
          type="number"
          min={1}
          defaultValue={a.diasMaxFuturo}
          hint="Cuántos días hacia adelante muestra el calendario."
        />
        <TextField
          label="Máximo de personas por reserva"
          name="cuposMaxPorReserva"
          type="number"
          min={1}
          defaultValue={a.cuposMaxPorReserva}
          hint="Grupos más grandes se atienden por WhatsApp."
        />
        <TextField
          label="Cancelación en línea hasta (horas antes)"
          name="horasMinCancelacion"
          type="number"
          min={0}
          defaultValue={a.horasMinCancelacion}
          hint="Después de esto el cliente debe escribir."
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="cerrarFestivos"
          defaultChecked={a.cerrarFestivos}
          className="mt-0.5 w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
        />
        <span className="text-sm text-on-surface-soft">
          Cerrar en festivos de Colombia
          <span className="block text-xs text-on-surface-muted">Se calculan solos (Ley Emiliani), no hay que cargarlos.</span>
        </span>
      </label>

      <MensajeForm estado={estado} />
      <Button type="submit" loading={enviando}>
        Guardar reglas
      </Button>
    </form>
  );
}
