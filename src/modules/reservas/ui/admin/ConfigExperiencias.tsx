'use client';

import { useActionState } from 'react';
import { Badge, Button, TextAreaField, TextField } from '@/shared/ui';
import { guardarExperienciaAction, type EstadoFormAdmin } from '../../actions/admin';
import type { ExperienciaAdmin } from '../../domain/tipos';
import { MensajeForm } from './MensajeForm';

export function ConfigExperiencias({ experiencias }: { experiencias: ExperienciaAdmin[] }) {
  return (
    <div className="space-y-6">
      {experiencias.map((e) => (
        <FormExperiencia key={e.id} experiencia={e} />
      ))}
    </div>
  );
}

function FormExperiencia({ experiencia: e }: { experiencia: ExperienciaAdmin }) {
  const [estado, accion, enviando] = useActionState<EstadoFormAdmin, FormData>(guardarExperienciaAction, { ok: null });

  return (
    <form action={accion} className="rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-5 sm:p-6 space-y-5">
      <input type="hidden" name="id" value={e.id} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-serif text-xl text-on-surface">{e.nombre}</h3>
        <Badge tone={e.activa ? 'primary' : 'neutral'}>{e.activa ? 'Visible' : 'Oculta'}</Badge>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Nombre" name="nombre" defaultValue={e.nombre} required />
        <TextField label="Resumen" name="resumen" defaultValue={e.resumen} required />
        <TextField label="Precio por persona (COP)" name="precio" type="number" min={0} step={1000} defaultValue={e.precio} required />
        <TextField label="Duración (minutos)" name="duracionMin" type="number" min={5} defaultValue={e.duracionMin} required />
        <TextField label="Idiomas (separados por coma)" name="idiomas" defaultValue={e.idiomas.join(', ')} required />
        <TextField label="Cafés" name="cafes" defaultValue={e.cafes} />
      </div>
      <TextAreaField label="Descripción" name="descripcion" defaultValue={e.descripcion} required />
      <TextAreaField label="Temática" name="tematica" defaultValue={e.tematica} />

      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="activa" defaultChecked={e.activa} className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer" />
        <span className="text-sm text-on-surface-soft">Visible en /reservar</span>
      </label>
      <p className="text-xs text-on-surface-muted">
        Cambiar el precio no afecta a reservas ya hechas: cada reserva guarda el precio del momento.
      </p>

      <MensajeForm estado={estado} />
      <Button type="submit" loading={enviando}>
        Guardar
      </Button>
    </form>
  );
}
