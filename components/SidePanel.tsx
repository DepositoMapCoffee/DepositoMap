'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { departamentos } from '@/data/mapaData';
import { getPanelVariants, staggerContainerVariants } from '@/lib/animations';
import CoffeeCard from './CoffeeCard';

export default function SidePanel() {
  const { selectedDept, clearSelection, coffees, isLoading } = useCoffeeStore();
  
  // Encontramos los datos del departamento seleccionado para el título
  const deptData = React.useMemo(() => 
    departamentos.find(d => d.id === selectedDept), 
  [selectedDept]);

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
              onClick={clearSelection}
              className="p-2.5 rounded-full bg-brand-gray hover:bg-brand-gray-light text-gray-400 hover:text-white transition-all duration-300 shadow-lg border border-brand-gray-light/50"
              aria-label="Cerrar panel"
            >
              <X className="w-5 h-5" />
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
                  <p className="text-gray-400 text-sm leading-relaxed mb-8 italic border-l-2 border-brand-accent pl-4 py-1">
                    {deptData.descripcion}
                  </p>
                )}
                <motion.div
                  variants={staggerContainerVariants}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {coffees.map((coffee) => (
                    <CoffeeCard key={coffee.id} coffee={coffee} />
                  ))}
                </motion.div>
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
