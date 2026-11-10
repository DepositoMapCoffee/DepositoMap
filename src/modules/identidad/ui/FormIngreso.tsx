'use client';

import { useActionState } from 'react';
import { Button, TextField } from '@/shared/ui';
import { ingresar, type EstadoIngreso } from '../actions/sesion';

const INICIAL: EstadoIngreso = { error: null };

export function FormIngreso() {
  const [estado, accion, enviando] = useActionState(ingresar, INICIAL);

  return (
    <form action={accion} className="space-y-5">
      <TextField label="Correo" name="email" type="email" autoComplete="username" required autoFocus />
      <TextField label="Contraseña" name="clave" type="password" autoComplete="current-password" required />
      {estado.error && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
      <Button type="submit" size="lg" loading={enviando} className="w-full">
        Ingresar
      </Button>
    </form>
  );
}
