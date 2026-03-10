'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search, Filter } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { departamentos } from '@/data/mapaData';
import { getPanelVariants, staggerContainerVariants } from '@/lib/animations';
import CoffeeCard from './CoffeeCard';

export default function SidePanel() {
  const { selectedDept, clearSelection, coffees, isLoading } = useCoffeeStore();
  
  // Local state for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Encontramos los datos del departamento seleccionado para el título
  const deptData = useMemo(() => 
    departamentos.find(d => d.id === selectedDept), 
  [selectedDept]);

  // Filter coffees based on search term and category
  const filteredCoffees = useMemo(() => {
    return coffees.filter(coffee => {
      const matchesSearch = coffee.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            coffee.finca.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || coffee.categoria === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [coffees, searchTerm, categoryFilter]);

  return (
    <AnimatePresence>
      {selectedDept && (
        <motion.div
          variants={getPanelVariants()}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-x-0 bottom-0 top-[40vh] md:inset-y-0 md:left-auto md:right-0 md:w-[480px] bg-brand-black/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-brand-gray-light shadow-2xl flex flex-col z-40 rounded-t-3xl md:rounded-none"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex justify-between items-center p-6 md:p-8 bg-linear-to-b from-brand-black/95 to-transparent border-b border-brand-gray-light/50">
            <div>
              <h2 className="font-serif text-3xl text-brand-white mb-2 drop-shadow-md">
                {deptData?.nombre}
              </h2>
              <div className="flex items-center gap-2 text-brand-accent/80 text-sm tracking-widest uppercase">
                <span className="w-8 h-px bg-brand-accent/50 block"></span>
                Selección de Origen
              </div>
            </div>
            
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearSelection();
              }}
              className="relative z-50 p-2.5 rounded-full bg-brand-gray hover:bg-brand-gray-light text-brand-white transition-all duration-300 shadow-[0_0_15px_rgba(0,0,0,0.5)] border border-brand-gray-light/50 cursor-pointer active:scale-90 pointer-events-auto"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>
          </div>

          {/* Contenido (Lista de Cafés) */}
          <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-12 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-4 text-brand-accent">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm tracking-wide">Cargando orígenes...</p>
              </div>
            ) : coffees.length > 0 ? (
              <>
                {deptData?.descripcion && (
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic border-l-2 border-brand-accent pl-4 py-1">
                    {deptData.descripcion}
                  </p>
                )}

                {/* Filtros y Búsqueda */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Buscar por lote o finca..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-brand-black border border-brand-gray-light rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-white focus:outline-none focus:border-brand-accent/70 transition-colors placeholder:text-gray-600 shadow-inner"
                    />
                  </div>
                  <div className="relative w-full">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full bg-brand-black border border-brand-gray-light rounded-xl pl-9 pr-4 py-2.5 text-sm text-brand-white focus:outline-none focus:border-brand-accent/70 transition-colors appearance-none cursor-pointer shadow-inner"
                    >
                      <option value="all">Todas las categorías</option>
                      <option value="Regional">Regional</option>
                      <option value="Culturing">Culturing</option>
                      <option value="Varietal">Varietal</option>
                    </select>
                  </div>
                </div>

                {filteredCoffees.length > 0 ? (
                  <motion.div
                    key={categoryFilter + searchTerm} // Forzar re-animación al filtrar
                    variants={staggerContainerVariants}
                    initial="hidden"
                    animate="show"
                    className="space-y-4"
                  >
                    {filteredCoffees.map((coffee) => (
                      <CoffeeCard key={coffee.id} coffee={coffee} />
                    ))}
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center space-y-2 opacity-70">
                    <p className="text-brand-accent font-serif text-lg">No hay coincidencias</p>
                    <p className="text-xs text-gray-500">Prueba con otros términos de búsqueda o filtros.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-500 space-y-2">
                <p className="font-serif text-xl text-gray-400">Sin datos disponibles</p>
                <p className="text-sm">No tenemos cafés registrados para esta región aún.</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
