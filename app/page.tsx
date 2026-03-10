'use client';

import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { useCoffeeStore } from '@/store/coffeeStore';
import MapaColombia from '@/components/MapaColombia';
import SidePanel from '@/components/SidePanel';
import CoffeeBeanIcon from '@/components/CoffeeBeanIcon';

export default function Home() {
  const { loadActiveDepts, selectedDept, clearSelection } = useCoffeeStore();

  useEffect(() => {
    // Cargar departamentos con cafés activos al montar
    loadActiveDepts();
  }, [loadActiveDepts]);

  return (
    <main className="min-h-screen bg-brand-black text-brand-white overflow-hidden relative selection:bg-brand-accent/30 selection:text-brand-cream">
      
      {/* Background Decorativo (opcional, para dar textura al negro) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#1a1a1a] via-brand-black to-brand-black opacity-60 z-0" />

      {/* Header Fijo */}
      <header className="absolute top-0 inset-x-0 z-20 flex justify-between items-center px-6 py-6 md:px-10">
        <div className="flex items-center gap-3">
          <CoffeeBeanIcon className="w-8 h-8 text-brand-accent" />
          <div className="flex flex-col">
            <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-brand-cream leading-none">
              El Depósito
            </h1>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1 font-sans">
              Specialty Coffee
            </span>
          </div>
        </div>

        {/* Acceso Admin */}
        <Link 
          href="/admin"
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-brand-gray/50 hover:bg-brand-gray border border-brand-gray-light hover:border-brand-accent/50 transition-all duration-500 text-gray-400 hover:text-brand-accent backdrop-blur-sm group ${
            selectedDept ? 'opacity-0 pointer-events-none translate-x-4' : 'opacity-100 translate-x-0'
          }`}
          title="Panel de Administración"
        >
          <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        </Link>
      </header>

      {/* Contenedor Principal */}
      <div className="relative z-10 w-full h-screen flex flex-col md:flex-row">
        
        {/* Área del mapa interactivo */}
        <div className={`flex-1 w-full h-[60vh] md:h-screen md:w-auto relative transition-all duration-500 ease-in-out ${
          selectedDept ? 'md:pr-[480px]' : ''
        }`}>
          {/* Eliminated the instruction pulse box as requested */}

          <MapaColombia />
        </div>

      </div>

      {/* Blur overlay that covers the map and header when a department is selected */}
      {selectedDept && (
        <div 
          className="fixed inset-0 bg-brand-black/50 backdrop-blur-sm z-30 transition-all duration-500"
          onClick={clearSelection}
          aria-hidden="true"
        />
      )}

      {/* Panel lateral detallado */}
      <SidePanel />

    </main>
  );
}
