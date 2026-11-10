'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge, Button, cn } from '@/shared/ui';
import { alternarVisibilidad, eliminarProductoAction } from '../actions/admin';
import { DEPARTAMENTOS, nombreDepartamento } from '../domain/departamentos';
import type { Producto } from '../domain/tipos';
import { FormProducto } from './FormProducto';

type Filtro = 'todos' | 'cafe' | 'chocolate' | 'ocultos';

const FILTROS: { id: Filtro; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'cafe', etiqueta: 'Cafés' },
  { id: 'chocolate', etiqueta: 'Chocolates' },
  { id: 'ocultos', etiqueta: 'Ocultos' },
];

const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function CatalogoAdmin({ productos }: { productos: Producto[] }) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [departamento, setDepartamento] = useState('');
  const [editando, setEditando] = useState<Producto | 'nuevo' | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);

  const visibles = useMemo(() => {
    const q = normalizar(busqueda.trim());
    return productos.filter((p) => {
      if (filtro === 'cafe' && p.tipo !== 'cafe') return false;
      if (filtro === 'chocolate' && p.tipo !== 'chocolate') return false;
      if (filtro === 'ocultos' && p.visible) return false;
      if (departamento && p.departamentoId !== departamento) return false;
      if (!q) return true;
      return [p.nombre, p.finca, p.notas, nombreDepartamento(p.departamentoId)].some((c) => c && normalizar(c).includes(q));
    });
  }, [productos, busqueda, filtro, departamento]);

  // Cerrar el editor con Escape.
  useEffect(() => {
    if (!editando) return;
    const alPulsar = (e: KeyboardEvent) => e.key === 'Escape' && setEditando(null);
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [editando]);

  const totalOcultos = productos.filter((p) => !p.visible).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-on-surface">Catálogo</h1>
          <p className="text-on-surface-muted mt-1">
            {productos.length} productos · {totalOcultos} ocultos del mapa
          </p>
        </div>
        <Button onClick={() => setEditando('nuevo')}>
          <Plus className="w-4 h-4" /> Nuevo producto
        </Button>
      </div>

      {aviso && (
        <p role="status" className={cn('text-sm', aviso.ok ? 'text-primary' : 'text-danger')}>
          {aviso.texto}
        </p>
      )}

      {/* Búsqueda y filtros */}
      <div className="flex flex-col lg:flex-row gap-3">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted pointer-events-none" />
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, finca, notas o departamento"
            className="w-full h-11 rounded-full bg-surface-low border border-outline-soft pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary"
          />
        </label>
        <select
          value={departamento}
          onChange={(e) => setDepartamento(e.target.value)}
          aria-label="Filtrar por departamento"
          className="h-11 rounded-full bg-surface-low border border-outline-soft px-4 text-sm text-on-surface focus:outline-none focus:border-primary"
        >
          <option value="">Todos los departamentos</option>
          {DEPARTAMENTOS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nombre}
            </option>
          ))}
        </select>
        <div className="flex gap-1 overflow-x-auto" role="group" aria-label="Filtrar por tipo">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={cn(
                'whitespace-nowrap h-11 px-4 rounded-full text-sm transition-colors cursor-pointer',
                filtro === f.id ? 'bg-primary-soft text-primary font-medium' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-high',
              )}
            >
              {f.etiqueta}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {visibles.length === 0 ? (
        <p className="rounded-[var(--radius-lg)] border border-dashed border-outline-soft p-10 text-center text-on-surface-muted">
          No hay productos con esos filtros.
        </p>
      ) : (
        <ul className="grid md:grid-cols-2 gap-3">
          {visibles.map((p) => (
            <FilaProducto
              key={p.id}
              producto={p}
              onEditar={() => setEditando(p)}
              onAviso={(a) => {
                setAviso(a);
                if (a.ok) router.refresh();
              }}
            />
          ))}
        </ul>
      )}

      {/* Editor lateral */}
      <div
        className={cn('fixed inset-0 z-50 transition-opacity duration-300', editando ? 'opacity-100' : 'opacity-0 pointer-events-none')}
        aria-hidden={!editando}
      >
        <button
          type="button"
          aria-label="Cerrar editor"
          tabIndex={-1}
          onClick={() => setEditando(null)}
          className="absolute inset-0 bg-surface-lowest/70 backdrop-blur-sm cursor-default"
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={editando === 'nuevo' ? 'Nuevo producto' : 'Editar producto'}
          className={cn(
            'absolute right-0 top-0 h-full w-full max-w-xl bg-surface-container border-l border-outline-soft shadow-2xl',
            'flex flex-col transition-transform duration-300 ease-[var(--ease-out-soft)]',
            editando ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <header className="flex items-center justify-between px-6 h-16 border-b border-outline-soft shrink-0">
            <h2 className="font-serif text-xl text-on-surface">
              {editando === 'nuevo' ? 'Nuevo producto' : editando ? `Editar: ${editando.nombre}` : ''}
            </h2>
            <button
              type="button"
              onClick={() => setEditando(null)}
              aria-label="Cerrar"
              className="w-10 h-10 grid place-items-center rounded-full text-on-surface-muted hover:text-on-surface hover:bg-surface-high cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6">
            {editando && (
              <FormProducto
                key={editando === 'nuevo' ? 'nuevo' : editando.id}
                producto={editando === 'nuevo' ? null : editando}
                onGuardado={() => {
                  setAviso({ ok: true, texto: editando === 'nuevo' ? 'Producto agregado.' : 'Cambios guardados.' });
                  setEditando(null);
                  router.refresh();
                }}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function FilaProducto({
  producto: p,
  onEditar,
  onAviso,
}: {
  producto: Producto;
  onEditar: () => void;
  onAviso: (a: { ok: boolean; texto: string }) => void;
}) {
  const [pendiente, iniciar] = useTransition();
  const [confirmar, setConfirmar] = useState(false);

  const ejecutar = (fn: () => Promise<{ ok: boolean; mensaje?: string; error?: string }>) =>
    iniciar(async () => {
      const r = await fn();
      onAviso({ ok: r.ok, texto: (r.ok ? r.mensaje : r.error) ?? '' });
    });

  return (
    <li
      className={cn(
        'rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-4 flex gap-4 transition-opacity',
        !p.visible && 'opacity-60',
        pendiente && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium text-on-surface truncate">{p.nombre}</h3>
          <Badge tone={p.tipo === 'chocolate' ? 'accent' : 'primary'}>{p.tipo === 'chocolate' ? 'Chocolate' : 'Café'}</Badge>
          {!p.visible && <Badge>Oculto</Badge>}
        </div>
        <p className="text-sm text-on-surface-muted mt-1 truncate">
          {nombreDepartamento(p.departamentoId)}
          {p.finca ? ` · ${p.finca}` : ''}
        </p>
        <p className="text-xs text-on-surface-muted/80 mt-1 truncate">
          {[p.proceso, p.categoria !== 'Chocolate' ? p.categoria : null, p.altura].filter(Boolean).join(' · ')}
        </p>
      </div>
      <div className="flex items-start gap-1 shrink-0">
        <BotonIcono
          etiqueta={p.visible ? 'Ocultar del mapa' : 'Mostrar en el mapa'}
          onClick={() => ejecutar(() => alternarVisibilidad(p.id, !p.visible))}
        >
          {p.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </BotonIcono>
        <BotonIcono etiqueta="Editar" onClick={onEditar}>
          <Pencil className="w-4 h-4" />
        </BotonIcono>
        {confirmar ? (
          <button
            type="button"
            onClick={() => ejecutar(() => eliminarProductoAction(p.id))}
            onBlur={() => setConfirmar(false)}
            className="h-9 px-3 rounded-full text-xs bg-danger-soft text-danger cursor-pointer"
          >
            ¿Eliminar?
          </button>
        ) : (
          <BotonIcono etiqueta="Eliminar" peligro onClick={() => setConfirmar(true)}>
            <Trash2 className="w-4 h-4" />
          </BotonIcono>
        )}
      </div>
    </li>
  );
}

function BotonIcono({
  etiqueta,
  onClick,
  peligro,
  children,
}: {
  etiqueta: string;
  onClick: () => void;
  peligro?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={etiqueta}
      title={etiqueta}
      onClick={onClick}
      className={cn(
        'w-9 h-9 grid place-items-center rounded-full text-on-surface-muted transition-colors cursor-pointer',
        peligro ? 'hover:text-danger hover:bg-danger-soft' : 'hover:text-on-surface hover:bg-surface-high',
      )}
    >
      {children}
    </button>
  );
}
