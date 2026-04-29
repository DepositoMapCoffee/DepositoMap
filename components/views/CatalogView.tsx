'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, Mountain, MapPin, ArrowRight, Loader2, Heart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { departamentos } from '@/data/mapaData';
import { useUserStore } from '@/store/userStore';
import { useToastStore } from '@/store/toastStore';
import type { Coffee } from '@/types';

// ─── Opciones de filtro ────────────────────────────────────────────

const CATEGORIAS = ['Regional', 'Culturing', 'Varietal'] as const;
const PROCESOS   = ['Lavado', 'Natural', 'Honey', 'Anaeróbico', 'Semi-Lavado'] as const;
const ALTURAS    = [
  { label: 'Menos de 1.500 msnm', min: 0,    max: 1499 },
  { label: '1.500 – 1.800 msnm',  min: 1500, max: 1800 },
  { label: '1.800 – 2.100 msnm',  min: 1801, max: 2100 },
  { label: 'Más de 2.100 msnm',   min: 2101, max: 9999 },
] as const;

// ─── Helpers ────────────────────────────────────────────────────────

const catStyle: Record<string, string> = {
  Varietal:  'bg-purple-950/50 text-purple-200/70 ring-1 ring-purple-700/25',
  Culturing: 'bg-amber-950/50  text-amber-200/70  ring-1 ring-amber-700/25',
  Regional:  'bg-surface-highest/60 text-on-surface-soft/70 ring-1 ring-outline-soft/20',
};

function parseAltura(s: string): number {
  const m = s.replace(/\./g, '').match(/\d{3,5}/);
  return m ? parseInt(m[0]) : 0;
}

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-sans font-semibold
        transition-all duration-200 cursor-pointer
        ${active
          ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/40'
          : 'bg-surface-highest/50 text-on-surface-soft/40 ring-1 ring-outline-soft/20 hover:text-on-surface-soft/70'
        }`}
    >
      {label}
    </button>
  );
}

// ─── Componente principal ────────────────────────────────────────────

export default function CatalogView() {
  const router = useRouter();
  const { session, favoriteIds, toggleFavorite } = useUserStore();
  const { addToast } = useToastStore();

  // Datos y carga
  const [coffees,       setCoffees]       = useState<Coffee[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [total,         setTotal]         = useState(0);
  const [activeDeptIds, setActiveDeptIds] = useState<string[]>([]);

  // Carga los departamentos que tienen al menos un café visible
  useEffect(() => {
    supabase
      .from('cafes')
      .select('departamento_id')
      .eq('visible', true)
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r: any) => r.departamento_id as string))];
          setActiveDeptIds(unique);
        }
      });
  }, []);

  // Filtros
  const [search,    setSearch]    = useState('');
  const [deptId,    setDeptId]    = useState('');
  const [categoria, setCategoria] = useState('');
  const [proceso,   setProceso]   = useState('');
  const [alturaKey, setAlturaKey] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const activeFilters =
    [search, deptId, categoria, proceso, alturaKey].filter(Boolean).length;

  const clearAll = () => {
    setSearch(''); setDeptId(''); setCategoria('');
    setProceso(''); setAlturaKey('');
  };

  // ─── Fetch ─────────────────────────────────────────────────────────
  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    let q = supabase.from('cafes').select('*').eq('visible', true);

    if (search)    q = q.or(`nombre.ilike.%${search}%,finca.ilike.%${search}%,notas.ilike.%${search}%`);
    if (deptId)    q = q.eq('departamento_id', deptId);
    if (categoria) q = q.eq('categoria', categoria);
    if (proceso)   q = q.eq('proceso', proceso);

    const { data, error } = await q.order('nombre');
    if (error) { setLoading(false); return; }

    let list = (data as Coffee[]) ?? [];

    // Filtro de altura (client-side — es string)
    if (alturaKey) {
      const range = ALTURAS.find(a => a.label === alturaKey);
      if (range) list = list.filter(c => {
        const h = parseAltura(c.altura);
        return h >= range.min && h <= range.max;
      });
    }

    setCoffees(list);
    setTotal(list.length);
    setLoading(false);
  }, [search, deptId, categoria, proceso, alturaKey]);

  // Debounce en search
  useEffect(() => {
    const t = setTimeout(fetchCatalog, 350);
    return () => clearTimeout(t);
  }, [fetchCatalog]);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ══════════════════════════════════════════
          HEADER del catálogo
      ══════════════════════════════════════════ */}
      <div
        className="shrink-0 px-5 md:px-8 pt-6 pb-4 border-b border-outline-soft/15"
        style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(12px)' }}
      >
        {/* Título */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-brand-accent/70 font-sans mb-1">
              El Depósito
            </p>
            <h1 className="font-serif text-2xl md:text-3xl text-on-surface font-medium tracking-tight">
              Catálogo de Orígenes
            </h1>
          </div>
          <span className="text-xs text-on-surface-soft/35 font-sans tabular-nums">
            {loading ? '…' : total} {total === 1 ? 'lote' : 'lotes'}
          </span>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-outline/60 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por lote, finca o nota de cata…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-low/80 pl-10 pr-4 py-2.5 rounded-lg text-sm text-on-surface
              ghost-border focus:outline-none focus:border-brand-accent/40
              transition-colors placeholder:text-outline/40"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/50 hover:text-on-surface cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Barra de control de filtros */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans
              transition-all duration-200 cursor-pointer
              ${showFilters
                ? 'bg-brand-accent/15 text-brand-accent ring-1 ring-brand-accent/30'
                : 'bg-surface-highest/50 text-on-surface-soft/50 ring-1 ring-outline-soft/20 hover:text-on-surface-soft/70'
              }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filtros
            {activeFilters > 0 && (
              <span className="ml-1 w-4 h-4 rounded-full bg-brand-accent text-brand-black text-[9px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
          {activeFilters > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1 text-[10px] text-on-surface-soft/35 hover:text-brand-accent transition-colors cursor-pointer">
              <X className="w-3 h-3" /> Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          PANEL DE FILTROS (expandible)
      ══════════════════════════════════════════ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="shrink-0 overflow-hidden border-b border-outline-soft/15"
            style={{ background: 'rgba(17,17,17,0.97)' }}
          >
            <div className="px-5 md:px-8 py-5 space-y-5">

              {/* Departamento */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-soft/35 font-sans mb-2.5">
                  Departamento
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Todos" active={!deptId} onClick={() => setDeptId('')} />
                  {departamentos
                    .filter(d => activeDeptIds.includes(d.id))
                    .map(d => (
                      <FilterPill key={d.id} label={d.nombre} active={deptId === d.id} onClick={() => setDeptId(deptId === d.id ? '' : d.id)} />
                    ))}
                </div>
              </div>

              {/* Categoría */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-soft/35 font-sans mb-2.5">
                  Categoría
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Todas" active={!categoria} onClick={() => setCategoria('')} />
                  {CATEGORIAS.map(c => (
                    <FilterPill key={c} label={c} active={categoria === c} onClick={() => setCategoria(categoria === c ? '' : c)} />
                  ))}
                </div>
              </div>

              {/* Proceso */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-soft/35 font-sans mb-2.5">
                  Proceso
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Todos" active={!proceso} onClick={() => setProceso('')} />
                  {PROCESOS.map(p => (
                    <FilterPill key={p} label={p} active={proceso === p} onClick={() => setProceso(proceso === p ? '' : p)} />
                  ))}
                </div>
              </div>

              {/* Altura */}
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] text-on-surface-soft/35 font-sans mb-2.5">
                  Altura
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterPill label="Cualquier altura" active={!alturaKey} onClick={() => setAlturaKey('')} />
                  {ALTURAS.map(a => (
                    <FilterPill key={a.label} label={a.label} active={alturaKey === a.label} onClick={() => setAlturaKey(alturaKey === a.label ? '' : a.label)} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════
          LISTA DE CAFÉS
      ══════════════════════════════════════════ */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40 gap-3 text-brand-accent/50">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs uppercase tracking-widest font-sans">Cargando catálogo…</span>
          </div>
        ) : coffees.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 opacity-50">
            <p className="font-serif text-xl text-on-surface">Sin resultados</p>
            <p className="text-xs text-on-surface-soft/50 font-sans tracking-wide">
              Ajusta los filtros para ver más lotes.
            </p>
          </div>
        ) : (
          <motion.ul
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {coffees.map((coffee, idx) => {
              const deptName = departamentos.find(d => d.id === coffee.departamento_id)?.nombre ?? '';
              return (
                <motion.li
                  key={coffee.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                  onClick={() => router.push(`/lote/${coffee.id}`)}
                  className="group relative flex items-center gap-5 px-5 md:px-8 py-5
                    border-b border-outline-soft/10 cursor-pointer
                    hover:bg-surface-low/60 transition-colors duration-200"
                >
                  {/* Número de índice */}
                  <span className="shrink-0 font-sans text-[11px] tabular-nums text-outline/40 w-6 text-right
                    group-hover:text-brand-accent/50 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Gold thread hover */}
                  <span className="absolute left-0 top-4 bottom-4 w-[2px] rounded-full bg-brand-accent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Contenido principal */}
                  <div className="flex-1 min-w-0">
                    {/* Nombre + categoría + Favorito */}
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <h3 className="font-serif text-lg text-on-surface leading-tight
                        group-hover:text-brand-accent transition-colors duration-250">
                        {coffee.nombre}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold ${catStyle[coffee.categoria] ?? catStyle['Regional']}`}>
                          {coffee.categoria}
                        </span>
                        
                        <button 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!session?.user) {
                              addToast('Debes iniciar sesión en "Usuario" para guardar favoritos.', 'info');
                              return;
                            }
                            const { success, requiresAuth } = await toggleFavorite(coffee.id);
                            if (requiresAuth) {
                              addToast('Debes iniciar sesión en "Usuario" para guardar favoritos.', 'info');
                            } else if (success) {
                              if (favoriteIds.includes(coffee.id)) {
                                addToast('Café eliminado de tus favoritos', 'info');
                              } else {
                                addToast('¡Café guardado en tus favoritos!', 'success');
                              }
                            } else {
                              addToast('Hubo un error al actualizar tus favoritos.', 'error');
                            }
                          }}
                          className={`p-1.5 rounded-full transition-all duration-300
                            ${favoriteIds.includes(coffee.id) 
                              ? 'bg-brand-accent/20 text-brand-accent shadow-[0_0_10px_rgba(47,163,107,0.3)]' 
                              : 'bg-surface-highest/50 text-outline-soft/60 hover:text-brand-accent hover:bg-surface-highest'
                            }
                          `}
                        >
                          <Heart 
                            className={`w-3.5 h-3.5 transition-transform duration-300 ${favoriteIds.includes(coffee.id) ? 'fill-brand-accent scale-110' : 'scale-100 hover:scale-110'}`} 
                          />
                        </button>
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-on-surface-soft/45">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {coffee.finca}{deptName ? ` · ${deptName}` : ''}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Mountain className="w-3 h-3 shrink-0" />
                        {coffee.altura}
                      </span>
                      <span className="text-on-surface-soft/35 italic">
                        {coffee.proceso}
                      </span>
                    </div>

                    {/* Notas — se muestran en hover */}
                    {coffee.notas && (
                      <p className="text-[11px] text-on-surface-soft/30 italic mt-1.5 line-clamp-1
                        group-hover:text-on-surface-soft/50 transition-colors">
                        {coffee.notas}
                      </p>
                    )}
                  </div>

                  {/* Flecha */}
                  <div className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                    ring-1 ring-outline-soft/20 text-outline/40
                    group-hover:ring-brand-accent/40 group-hover:text-brand-accent group-hover:bg-brand-accent/8
                    transition-all duration-250">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </div>
  );
}
