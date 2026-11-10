'use client';

import { useActionState, useState } from 'react';
import { Button, SelectField, TextAreaField, TextField, cn } from '@/shared/ui';
import { guardarProducto, type EstadoFormCatalogo } from '../actions/admin';
import { DEPARTAMENTOS } from '../domain/departamentos';
import {
  CACAO_SUGERIDO,
  CATEGORIAS_CAFE,
  CATEGORIA_CHOCOLATE,
  METODOS_SUGERIDOS,
  PRESENTACIONES_SUGERIDAS,
  PROCESOS_SUGERIDOS,
  type Producto,
  type TipoProducto,
} from '../domain/tipos';

type Props = {
  producto: Producto | null;
  onGuardado: () => void;
};

/** Formulario de café o chocolate (crear o editar). */
export function FormProducto({ producto, onGuardado }: Props) {
  const [tipo, setTipo] = useState<TipoProducto>(producto?.tipo ?? 'cafe');
  const esChocolate = tipo === 'chocolate';
  const [estado, accion, guardando] = useActionState<EstadoFormCatalogo, FormData>(async (previo, datos) => {
    const r = await guardarProducto(previo, datos);
    if (r.ok) onGuardado();
    return r;
  }, { ok: null });

  return (
    <form action={accion} className="space-y-5">
      {producto && <input type="hidden" name="id" value={producto.id} />}
      <input type="hidden" name="tipo" value={tipo} />

      <fieldset>
        <legend className="text-sm font-medium text-on-surface-soft mb-2">Tipo de producto</legend>
        <div className="grid grid-cols-2 gap-1 rounded-full bg-surface-low p-1">
          {(['cafe', 'chocolate'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              aria-pressed={tipo === t}
              className={cn(
                'h-9 rounded-full text-sm transition-colors cursor-pointer',
                tipo === t ? 'bg-surface-high text-on-surface font-medium' : 'text-on-surface-muted hover:text-on-surface',
              )}
            >
              {t === 'cafe' ? 'Café' : 'Chocolate'}
            </button>
          ))}
        </div>
      </fieldset>

      <TextField
        label={esChocolate ? 'Nombre del producto' : 'Nombre del lote / café'}
        name="nombre"
        defaultValue={producto?.nombre}
        placeholder={esChocolate ? 'Barra 72% Cacao 40 gr' : 'Geisha Lavado Especial'}
        required
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <SelectField label="Departamento" name="departamentoId" defaultValue={producto?.departamentoId ?? ''} required>
          <option value="" disabled>
            Elige el departamento
          </option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </SelectField>
        <TextField label="Finca / productor" name="finca" defaultValue={producto?.finca ?? ''} />
        <TextField
          key={`altura-${tipo}`}
          label={esChocolate ? 'Presentación (peso)' : 'Altura (msnm)'}
          name="altura"
          defaultValue={producto?.tipo === tipo ? (producto?.altura ?? '') : ''}
          placeholder={esChocolate ? '40 gr' : '1950 msnm'}
          list={esChocolate ? 'lista-presentaciones' : undefined}
        />
        <TextField
          key={`proceso-${tipo}`}
          label={esChocolate ? 'Porcentaje de cacao' : 'Proceso'}
          name="proceso"
          defaultValue={producto?.tipo === tipo ? (producto?.proceso ?? '') : esChocolate ? '72% Cacao' : 'Lavado'}
          list={esChocolate ? 'lista-cacao' : 'lista-procesos'}
        />
        {esChocolate ? (
          <input type="hidden" name="categoria" value={CATEGORIA_CHOCOLATE} />
        ) : (
          <SelectField label="Categoría" name="categoria" defaultValue={producto?.categoria ?? 'Regional'}>
            {CATEGORIAS_CAFE.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </SelectField>
        )}
        <TextField
          label={esChocolate ? 'Notas de sabor' : 'Notas de cata'}
          name="notas"
          defaultValue={producto?.notas ?? ''}
          placeholder="Panela, frutos rojos, cacao…"
          hint="Separadas por coma."
        />
      </div>

      <TextAreaField label="Historia / descripción" name="descripcionLarga" defaultValue={producto?.descripcionLarga ?? ''} />

      {!esChocolate && (
        <div className="grid sm:grid-cols-2 gap-4">
          <TextField label="Método sugerido" name="metodoSugerido" defaultValue={producto?.metodoSugerido ?? ''} list="lista-metodos" />
          <TextAreaField label="Preparación sugerida" name="preparacion" defaultValue={producto?.preparacion ?? ''} className="min-h-12" />
          <TextAreaField label="Sugerencias del tostador" name="sugerencias" defaultValue={producto?.sugerencias ?? ''} className="min-h-12" />
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name="visible"
          defaultChecked={producto?.visible ?? true}
          className="w-5 h-5 accent-[var(--color-primary)] cursor-pointer"
        />
        <span className="text-sm text-on-surface-soft">Visible en el mapa</span>
      </label>

      <datalist id="lista-procesos">{PROCESOS_SUGERIDOS.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="lista-cacao">{CACAO_SUGERIDO.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="lista-presentaciones">{PRESENTACIONES_SUGERIDAS.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="lista-metodos">{METODOS_SUGERIDOS.map((v) => <option key={v} value={v} />)}</datalist>

      {estado.ok === false && (
        <p role="alert" className="text-sm text-danger">
          {estado.error}
        </p>
      )}
      <Button type="submit" size="lg" loading={guardando} className="w-full">
        {producto ? 'Guardar cambios' : 'Agregar al catálogo'}
      </Button>
    </form>
  );
}
