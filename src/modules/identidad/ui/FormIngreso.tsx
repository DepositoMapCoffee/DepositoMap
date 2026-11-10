'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Button, TextField, cn } from '@/shared/ui';
import { POLITICA_DATOS } from '@/shared/config/negocio';
import { ingresar, registrar, type EstadoIngreso } from '../actions/sesion';

const INICIAL: EstadoIngreso = { error: null };

/** Un solo formulario para ingresar o crear cuenta (clientes y administradores). */
export function FormIngreso({ siguiente }: { siguiente?: string }) {
  const [modo, setModo] = useState<'ingresar' | 'registrar'>('ingresar');
  const [estadoIngreso, accionIngreso, ingresando] = useActionState(ingresar, INICIAL);
  const [estadoRegistro, accionRegistro, registrando] = useActionState(registrar, INICIAL);
  const esRegistro = modo === 'registrar';
  const estado = esRegistro ? estadoRegistro : estadoIngreso;

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 gap-1 rounded-full bg-surface-low p-1 mb-6">
        {(['ingresar', 'registrar'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => setModo(m)}
            className={cn(
              'h-10 rounded-full text-sm transition-colors cursor-pointer',
              modo === m ? 'bg-surface-high text-on-surface font-medium' : 'text-on-surface-muted hover:text-on-surface',
            )}
          >
            {m === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        ))}
      </div>

      <form key={modo} action={esRegistro ? accionRegistro : accionIngreso} className="space-y-5 animate-aparecer">
        {siguiente && <input type="hidden" name="siguiente" value={siguiente} />}
        <TextField label="Correo" name="email" type="email" autoComplete={esRegistro ? 'email' : 'username'} required />
        <TextField
          label="Contraseña"
          name="clave"
          type="password"
          autoComplete={esRegistro ? 'new-password' : 'current-password'}
          minLength={esRegistro ? 8 : undefined}
          hint={esRegistro ? 'Mínimo 8 caracteres.' : undefined}
          required
        />
        {esRegistro && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" name="aceptaDatos" required className="mt-0.5 w-5 h-5 shrink-0 accent-[var(--color-primary)] cursor-pointer" />
            <span className="text-sm text-on-surface-soft leading-relaxed">
              Acepto la{' '}
              <Link href={POLITICA_DATOS.ruta} target="_blank" className="text-primary underline underline-offset-2">
                política de tratamiento de datos
              </Link>
              .
            </span>
          </label>
        )}
        {estado.error && (
          <p role="alert" className="text-sm text-danger">
            {estado.error}
          </p>
        )}
        {estado.mensaje && (
          <p role="status" className="text-sm text-primary">
            {estado.mensaje}
          </p>
        )}
        <Button type="submit" size="lg" loading={esRegistro ? registrando : ingresando} className="w-full">
          {esRegistro ? 'Crear cuenta' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}
