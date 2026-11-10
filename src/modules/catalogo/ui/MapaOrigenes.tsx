'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search } from 'lucide-react';
import { cn } from '@/shared/ui';
import { alternarFavoritoAction, misFavoritos } from '../actions/usuario';
import { departamentos as GEOMETRIA, isCoffeeRegion } from '../domain/mapaColombia';
import type { Producto } from '../domain/tipos';
import { TarjetaProducto } from './TarjetaProducto';

type Props = {
  productos: Producto[];
  regionInicial?: string;
  /** Server action de identidad (se recibe por props: este módulo no la importa). */
  estadoSesion: () => Promise<{ email: string; esAdmin: boolean } | null>;
};

type Filtro = 'todo' | 'cafe' | 'chocolate';

// Medido sobre la geometría (getBBox): x 261–876, y 103–954, con margen.
const VIEWBOX = '248 92 642 874';
const normalizar = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/**
 * Mapa de orígenes: Colombia con las regiones que tienen productos y, al
 * lado, las fichas de la región elegida. Teclado: Tab recorre las regiones
 * con productos; Enter o Espacio las selecciona.
 */
export function MapaOrigenes({ productos, regionInicial, estadoSesion }: Props) {
  const router = useRouter();
  const porRegion = useMemo(() => {
    const m = new Map<string, Producto[]>();
    for (const p of productos) m.set(p.departamentoId, [...(m.get(p.departamentoId) ?? []), p]);
    return m;
  }, [productos]);

  const regionesConProductos = useMemo(
    () =>
      GEOMETRIA.filter((d) => porRegion.has(d.id)).sort(
        (a, b) => (porRegion.get(b.id)?.length ?? 0) - (porRegion.get(a.id)?.length ?? 0),
      ),
    [porRegion],
  );

  const [seleccionada, setSeleccionada] = useState<string>(
    regionInicial && porRegion.has(regionInicial) ? regionInicial : (regionesConProductos[0]?.id ?? ''),
  );
  const [encima, setEncima] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>('todo');
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [conSesion, setConSesion] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, iniciar] = useTransition();
  const panel = useRef<HTMLDivElement>(null);

  // Sesión y favoritos del visitante (la página es estática; esto es personal).
  useEffect(() => {
    let vigente = true;
    (async () => {
      const sesion = await estadoSesion();
      if (!vigente || !sesion) return;
      setConSesion(true);
      const ids = await misFavoritos();
      if (vigente) setFavoritos(new Set(ids));
    })();
    return () => {
      vigente = false;
    };
  }, [estadoSesion]);

  const region = GEOMETRIA.find((d) => d.id === seleccionada);
  const deRegion = porRegion.get(seleccionada) ?? [];
  const visibles = deRegion.filter((p) => {
    if (filtro !== 'todo' && p.tipo !== filtro) return false;
    const q = normalizar(busqueda.trim());
    return !q || [p.nombre, p.finca, p.notas, p.proceso].some((c) => c && normalizar(c).includes(q));
  });
  const hayChocolates = deRegion.some((p) => p.tipo === 'chocolate');
  const hayCafes = deRegion.some((p) => p.tipo === 'cafe');

  const elegir = (id: string) => {
    setSeleccionada(id);
    setFiltro('todo');
    setBusqueda('');
    // En móvil el panel queda debajo del mapa: llevar la vista hasta él.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      panel.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const alternarFavorito = (id: string) => {
    if (!conSesion) {
      router.push('/ingresar?siguiente=/mapa');
      return;
    }
    const antes = favoritos;
    const nuevo = new Set(antes);
    if (nuevo.has(id)) nuevo.delete(id);
    else nuevo.add(id);
    setFavoritos(nuevo);
    iniciar(async () => {
      const r = await alternarFavoritoAction(id);
      if (r.ok) {
        setAviso(r.favorito ? 'Guardado en tus favoritos.' : 'Quitado de tus favoritos.');
      } else {
        setFavoritos(antes);
        if (r.requiereIngreso) router.push('/ingresar?siguiente=/mapa');
        else setAviso(r.error);
      }
    });
  };

  const nombreEncima = encima ? GEOMETRIA.find((d) => d.id === encima)?.nombre : null;

  return (
    <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-10 lg:gap-14">
      {/* ── Mapa ── */}
      <div className="lg:sticky lg:top-24 self-start">
        <div className="relative rounded-[var(--radius-xl)] border border-outline-soft bg-surface-low overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'radial-gradient(60% 50% at 50% 40%, rgba(47,163,107,0.10) 0%, transparent 70%)' }}
          />
          <p aria-live="polite" className="absolute top-4 left-5 z-10 text-sm text-on-surface-soft min-h-5">
            {nombreEncima ?? ' '}
          </p>
          <svg viewBox={VIEWBOX} className="relative w-full h-auto max-h-[72vh] mx-auto" role="group" aria-label="Mapa de Colombia">
            {GEOMETRIA.map((d) => {
              const conProductos = porRegion.has(d.id);
              const activa = d.id === seleccionada;
              return (
                <path
                  key={d.id}
                  d={d.path}
                  role={conProductos ? 'button' : undefined}
                  tabIndex={conProductos ? 0 : undefined}
                  aria-pressed={conProductos ? activa : undefined}
                  aria-label={conProductos ? `${d.nombre}, ${porRegion.get(d.id)!.length} productos` : undefined}
                  onMouseEnter={() => setEncima(d.id)}
                  onMouseLeave={() => setEncima(null)}
                  onFocus={() => setEncima(d.id)}
                  onBlur={() => setEncima(null)}
                  onClick={() => conProductos && elegir(d.id)}
                  onKeyDown={(e) => {
                    if (conProductos && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      elegir(d.id);
                    }
                  }}
                  className={cn(
                    'stroke-[1.2] transition-[fill,stroke] duration-300 outline-none',
                    activa
                      ? 'fill-primary-hover stroke-on-surface/80 [filter:drop-shadow(0_0_10px_rgba(61,189,127,0.55))]'
                      : conProductos
                        ? 'fill-verde-dim/45 stroke-verde/50 hover:fill-verde/80 focus-visible:fill-verde/80 cursor-pointer'
                        : isCoffeeRegion(d.nombre)
                          ? 'fill-surface-highest stroke-outline-soft'
                          : 'fill-surface-high stroke-outline-soft',
                  )}
                />
              );
            })}
          </svg>
          <ul className="relative flex flex-wrap gap-x-5 gap-y-1 px-5 pb-4 text-xs text-on-surface-muted">
            <li className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-primary-hover" aria-hidden="true" /> Región elegida
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-verde-dim/60" aria-hidden="true" /> Con cafés en catálogo
            </li>
            <li className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-surface-highest" aria-hidden="true" /> Región cafetera
            </li>
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Regiones con productos">
          {regionesConProductos.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => elegir(d.id)}
              aria-pressed={d.id === seleccionada}
              className={cn(
                'inline-flex items-center gap-2 h-10 px-4 rounded-full border text-sm transition-colors cursor-pointer',
                d.id === seleccionada
                  ? 'border-primary bg-primary-soft text-on-surface'
                  : 'border-outline-soft text-on-surface-soft hover:border-outline',
              )}
            >
              <MapPin className="w-4 h-4" /> {d.nombre}
              <span className="text-xs text-on-surface-muted">{porRegion.get(d.id)?.length}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Panel de la región ── */}
      <div ref={panel} className="scroll-mt-24 min-w-0" aria-live="polite">
        {region ? (
          <div key={region.id} className="animate-entrar">
            <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">
              {isCoffeeRegion(region.nombre) ? 'Región cafetera' : 'Origen'}
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl mt-3 text-on-surface">{region.nombre}</h2>
            {region.descripcion && (
              <p className="mt-4 text-on-surface-soft leading-relaxed border-l-2 border-primary/50 pl-4">{region.descripcion}</p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <label className="relative flex-1">
                <span className="sr-only">Buscar en {region.nombre}</span>
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-muted pointer-events-none" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre, finca o notas"
                  className="w-full h-11 rounded-full bg-surface-low border border-outline-soft pl-11 pr-4 text-sm text-on-surface placeholder:text-on-surface-muted focus:outline-none focus:border-primary"
                />
              </label>
              {hayCafes && hayChocolates && (
                <div className="flex gap-1" role="group" aria-label="Filtrar por tipo">
                  {(['todo', 'cafe', 'chocolate'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFiltro(f)}
                      aria-pressed={filtro === f}
                      className={cn(
                        'h-11 px-4 rounded-full text-sm transition-colors cursor-pointer',
                        filtro === f ? 'bg-primary-soft text-primary font-medium' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-high',
                      )}
                    >
                      {f === 'todo' ? 'Todo' : f === 'cafe' ? 'Cafés' : 'Chocolates'}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {aviso && (
              <p role="status" className="mt-4 text-sm text-primary">
                {aviso}
              </p>
            )}

            <div className="mt-6 space-y-4">
              {visibles.length === 0 ? (
                <p className="rounded-[var(--radius-lg)] border border-dashed border-outline-soft p-8 text-center text-on-surface-muted">
                  No hay productos que coincidan.
                </p>
              ) : (
                visibles.map((p) => (
                  <TarjetaProducto
                    key={p.id}
                    producto={p}
                    favorito={favoritos.has(p.id)}
                    onFavorito={() => alternarFavorito(p.id)}
                    pendiente={pendiente}
                  />
                ))
              )}
            </div>
          </div>
        ) : (
          <p className="text-on-surface-muted">Todavía no hay productos en el catálogo.</p>
        )}
      </div>
    </div>
  );
}
