'use client';

import { useActionState, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { Button, SelectField, TextAreaField, TextField, buttonStyles, cn } from '@/shared/ui';
import { crearReservaManual, franjasParaAdmin, type EstadoFormAdmin } from '../../actions/admin';
import type { ExperienciaAdmin, Franja } from '../../domain/tipos';
import { formatoHora, formatoPrecio } from '../formato';

const CANALES = [
  { valor: 'whatsapp', etiqueta: 'WhatsApp' },
  { valor: 'telefono', etiqueta: 'Teléfono' },
  { valor: 'presencial', etiqueta: 'Presencial' },
] as const;

type Props = { experiencias: ExperienciaAdmin[]; fechaInicial: string };

export function FormReservaManual({ experiencias, fechaInicial }: Props) {
  const [hora, setHora] = useState('');
  // Tras registrar con éxito, se libera el horario elegido (React ya limpia los campos no controlados).
  const [estado, accion, enviando] = useActionState<EstadoFormAdmin, FormData>(async (previo, datos) => {
    const r = await crearReservaManual(previo, datos);
    if (r.ok) setHora('');
    return r;
  }, { ok: null });
  const [experienciaId, setExperienciaId] = useState(experiencias[0]?.id ?? '');
  const [fecha, setFecha] = useState(fechaInicial);
  const [cupos, setCupos] = useState(2);
  // null = aún no se han cargado los horarios de la fecha elegida.
  const [franjas, setFranjas] = useState<Franja[] | null>(null);
  const [cargando, iniciar] = useTransition();
  const experiencia = experiencias.find((e) => e.id === experienciaId);

  // Cargar horarios del día elegido (y recargar tras crear una reserva).
  useEffect(() => {
    if (!fecha) return;
    iniciar(async () => setFranjas(await franjasParaAdmin(fecha)));
  }, [fecha, estado]);

  const franja = franjas?.find((f) => f.hora === hora);

  return (
    <form action={accion} className="space-y-8 max-w-3xl">
      {/* Canal */}
      <fieldset>
        <legend className="text-sm font-medium text-on-surface-soft mb-2">¿Por dónde llegó?</legend>
        <div className="flex flex-wrap gap-2">
          {CANALES.map((c, i) => (
            <label key={c.valor} className="cursor-pointer">
              <input type="radio" name="canal" value={c.valor} defaultChecked={i === 0} className="peer sr-only" />
              <span className="inline-flex h-10 items-center rounded-full border border-outline-soft px-4 text-sm text-on-surface-soft transition-colors peer-checked:border-primary peer-checked:bg-primary-soft peer-checked:text-on-surface peer-focus-visible:outline-2 peer-focus-visible:outline-focus hover:border-outline">
                {c.etiqueta}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Experiencia y momento */}
      <div className="grid sm:grid-cols-2 gap-5">
        <SelectField label="Experiencia" name="experienciaId" value={experienciaId} onChange={(e) => setExperienciaId(e.target.value)}>
          {experiencias.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre} · {formatoPrecio(e.precio)}
            </option>
          ))}
        </SelectField>
        <TextField
          label="Fecha"
          name="fecha"
          type="date"
          value={fecha}
          onChange={(e) => {
            setFecha(e.target.value);
            setHora('');
            setFranjas(null);
          }}
          required
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-on-surface-soft mb-2">Horario</legend>
        <input type="hidden" name="hora" value={hora} />
        {cargando || franjas === null ? (
          <p className="text-sm text-on-surface-muted">Cargando horarios…</p>
        ) : franjas.length === 0 ? (
          <p className="text-sm text-on-surface-muted">No hay horarios configurados ese día.</p>
        ) : (
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Horario">
            {franjas.map((f) => {
              const elegible = f.estado === 'disponible';
              return (
                <button
                  key={f.hora}
                  type="button"
                  role="radio"
                  aria-checked={hora === f.hora}
                  disabled={!elegible}
                  onClick={() => setHora(f.hora)}
                  className={cn(
                    'rounded-[var(--radius-md)] border px-4 py-2.5 text-left transition-colors cursor-pointer',
                    hora === f.hora ? 'border-primary bg-primary-soft' : 'border-outline-soft hover:border-outline',
                    !elegible && 'opacity-40 cursor-not-allowed',
                  )}
                >
                  <span className="block font-serif text-lg text-on-surface">{formatoHora(f.hora)}</span>
                  <span className="block text-xs text-on-surface-muted">
                    {f.estado === 'bloqueada'
                      ? `Bloqueado: ${f.motivo}`
                      : f.estado === 'pasada'
                        ? 'Ya pasó'
                        : `${f.ocupados}/${f.capacidad} ocupados`}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </fieldset>

      <div className="grid sm:grid-cols-3 gap-5">
        <TextField
          label="Personas"
          name="cupos"
          type="number"
          min={1}
          max={franja ? Math.max(1, franja.capacidad - franja.ocupados) : 50}
          value={cupos}
          onChange={(e) => setCupos(Number(e.target.value))}
          hint={franja ? `Quedan ${Math.max(0, franja.capacidad - franja.ocupados)} cupos` : undefined}
          required
        />
        <SelectField label="Idioma" name="idioma" key={experienciaId} defaultValue={experiencia?.idiomas[0]}>
          {experiencia?.idiomas.map((i) => (
            <option key={i}>{i}</option>
          ))}
        </SelectField>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-on-surface-muted">Total</p>
          <p className="font-serif text-2xl text-accent-hover tabular-nums">
            {experiencia ? formatoPrecio(experiencia.precio * (cupos || 0)) : '—'}
          </p>
        </div>
      </div>

      {/* Cliente */}
      <div className="grid sm:grid-cols-2 gap-5">
        <TextField label="Nombre" name="nombre" autoComplete="off" required />
        <TextField label="Teléfono / WhatsApp" name="telefono" type="tel" inputMode="tel" placeholder="+57 300 000 0000" required />
        <TextField label="Correo (opcional)" name="email" type="email" inputMode="email" autoComplete="off" />
        <TextAreaField label="Notas (opcional)" name="notas" className="min-h-12" rows={1} />
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="confirmada" defaultChecked className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer" />
          <span className="text-sm text-on-surface-soft">Registrar como confirmada</span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" name="autorizaDatos" required className="mt-0.5 w-5 h-5 accent-[var(--color-primary)] cursor-pointer" />
          <span className="text-sm text-on-surface-soft">
            El cliente autorizó el tratamiento de sus datos para gestionar la reserva (por WhatsApp, teléfono o en persona),
            según la{' '}
            <a href="/privacidad" target="_blank" rel="noopener" className="text-primary underline underline-offset-2">
              política de datos
            </a>
            .
          </span>
        </label>
      </div>

      {estado.ok === false && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
      {estado.ok === true && (
        <div role="status" className="rounded-[var(--radius-lg)] border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-on-surface flex flex-wrap items-center gap-3">
          {estado.mensaje}
          <Link href={`/panel/reservas?dia=${fecha}`} className={buttonStyles('ghost', 'sm', 'text-primary')}>
            Ver en la agenda
          </Link>
        </div>
      )}

      <Button type="submit" size="lg" loading={enviando} disabled={!hora}>
        Registrar reserva
      </Button>
    </form>
  );
}
