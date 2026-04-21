'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search, Filter } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { departamentos } from '@/data/mapaData';
import { getPanelVariants, staggerContainerVariants } from '@/lib/animations';
import CoffeeCard from './CoffeeCard';

export default function SidePanel() {
  const { selectedDept, clearSelection, coffees, isLoading, fetchCoffees } = useCoffeeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const deptData = useMemo(() =>
    departamentos.find(d => d.id === selectedDept),
  [selectedDept]);

  React.useEffect(() => {
    if (!selectedDept) return;
    const delayDebounceFn = setTimeout(() => {
      fetchCoffees(selectedDept, searchTerm, categoryFilter);
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedDept, searchTerm, categoryFilter, fetchCoffees]);

  return (
    <AnimatePresence>
      {selectedDept && (
        <motion.div
          variants={getPanelVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-x-0 bottom-[68px] top-[42vh] md:top-[38vh] lg:inset-y-0 lg:left-auto lg:right-0 lg:w-[480px]
            flex flex-col z-40 rounded-t-3xl lg:rounded-none overflow-hidden
            shadow-[0_-8px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(90,90,90,0.15)]"
          style={{
            background: 'rgba(19, 19, 19, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* ── Mobile drag pill ── */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="w-10 h-1 rounded-full bg-outline-soft/50" />
          </div>

          {/* ── Header del panel ── */}
          <div
            className="sticky top-0 z-20 px-7 md:px-8 pt-6 pb-5"
            style={{
              background: 'linear-gradient(to bottom, rgba(19,19,19,1) 70%, rgba(19,19,19,0))',
            }}
          >
            <div className="flex justify-between items-start">
              {/* Nombre del departamento */}
              <div>
                {/* Eyebrow */}
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="block w-6 h-px bg-brand-accent/60" />
                  <span className="text-[10px] uppercase tracking-[0.22em] text-brand-accent/70 font-sans font-semibold">
                    Selección de Origen
                  </span>
                </div>
                <h2 className="font-serif text-4xl font-medium text-on-surface tracking-tight leading-none">
                  {deptData?.nombre}
                </h2>
              </div>

              {/* Botón cerrar */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearSelection();
                }}
                className="mt-1 p-2 rounded-full
                  bg-surface-highest/70 hover:bg-surface-bright
                  border border-outline-soft/30 hover:border-gold-container/40
                  text-on-surface-soft hover:text-gold-primary
                  transition-all duration-300 cursor-pointer active:scale-90 pointer-events-auto"
                aria-label="Cerrar panel"
              >
                <X className="w-4 h-4 pointer-events-none" />
              </button>
            </div>
          </div>

          {/* ── Contenido scrolleable ── */}
          <div className="flex-1 overflow-y-auto px-7 md:px-8 pb-12">
            {isLoading && coffees.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <Loader2 className="w-6 h-6 animate-spin text-brand-accent" />
                <p className="text-xs uppercase tracking-[0.15em] text-on-surface-soft/60">Cargando orígenes…</p>
              </div>
            ) : (
              <>
                {/* Descripción con Gold Thread */}
                {deptData?.descripcion && (
                  <p className="text-on-surface-soft/70 text-sm leading-relaxed mb-7 italic gold-thread pl-4 py-1">
                    {deptData.descripcion}
                  </p>
                )}

                {/* ── Filtros ── */}
                <div className="flex flex-col gap-2.5 mb-7">
                  {/* Búsqueda */}
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline/70 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Buscar por lote o finca…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-surface-lowest/80 pl-9 pr-4 py-2.5 text-sm text-on-surface
                        rounded-lg ghost-border
                        focus:outline-none focus:border-gold-container/50
                        transition-colors placeholder:text-outline/50"
                    />
                  </div>
                  {/* Categoría */}
                  <div className="relative w-full">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline/70 pointer-events-none" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-surface-lowest/80 pl-9 pr-4 py-2.5 text-sm text-on-surface
                        rounded-lg ghost-border
                        focus:outline-none focus:border-gold-container/50
                        transition-colors appearance-none cursor-pointer"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="Regional">Regional</option>
                      <option value="Culturing">Culturing</option>
                      <option value="Varietal">Varietal</option>
                    </select>
                  </div>
                </div>

                {/* Indicador de recarga */}
                {isLoading && coffees.length > 0 && (
                  <div className="flex items-center justify-center py-2 text-brand-accent/40 mb-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    <span className="text-[10px] uppercase tracking-wider">Actualizando…</span>
                  </div>
                )}

                {/* Lista de cafés */}
                {coffees.length > 0 ? (
                  <motion.div
                    key={selectedDept}
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-3"
                  >
                    {coffees.map((coffee) => (
                      <CoffeeCard key={coffee.id} coffee={coffee} />
                    ))}
                  </motion.div>
                ) : (
                  !isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-60">
                      <p className="text-brand-accent font-serif text-xl">No hay coincidencias</p>
                      <p className="text-xs text-outline/70 tracking-wide">
                        Prueba con otros términos de búsqueda o filtros.
                      </p>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
