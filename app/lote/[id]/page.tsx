'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Coffee } from '@/types';
import { Loader2, ArrowLeft, MapPin, Mountain } from 'lucide-react';
import { departamentos } from '@/data/mapaData';

export default function LoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoffee() {
      const { data, error } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) {
        setCoffee(data);
      }
      setLoading(false);
    }
    
    if (id) fetchCoffee();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!coffee) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-brand-white">
        <h1 className="text-2xl font-serif mb-4">Lote no encontrado</h1>
        <button onClick={() => router.push('/')} className="text-brand-accent hover:text-white transition-colors">
          Volver al mapa
        </button>
      </div>
    );
  }

  const deptoName = departamentos.find(d => d.id === coffee.departamento_id)?.nombre || coffee.departamento_id;

  return (
    <main className="min-h-screen bg-brand-black text-brand-white">
      {/* Background Decorativo */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-brand-gray-light/30 via-brand-black to-brand-black z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-brand-cream transition-colors mb-12 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Volver al Mapa
        </button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Header & Main Info */}
          <div>
            <div className="mb-6 flex gap-3 items-center">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-brand-gray-light border border-brand-gray text-gray-300">
                {coffee.proceso}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${
                coffee.categoria === 'Varietal' ? 'text-purple-300 bg-purple-900/30 border-purple-800/50' : 
                coffee.categoria === 'Culturing' ? 'text-amber-300 bg-amber-900/30 border-amber-800/50' : 
                'text-emerald-300 bg-emerald-900/30 border-emerald-800/50'
              }`}>
                {coffee.categoria}
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif font-medium text-brand-cream mb-4 leading-tight">
              {coffee.nombre}
            </h1>
            
            <p className="text-lg md:text-xl text-brand-accent/90 font-serif italic mb-8">
              {coffee.finca}
            </p>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-lg">{deptoName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mountain className="w-5 h-5 text-gray-500" />
                <span className="text-lg">{coffee.altura}</span>
              </div>
            </div>
          </div>

          {/* Tasting Notes & Details */}
          <div className="bg-brand-gray/50 backdrop-blur-md rounded-2xl p-8 border border-brand-gray-light/50 h-fit">
            <h3 className="font-serif text-xl tracking-wide text-brand-cream mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-brand-accent block"></span>
              Perfil de Taza
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {coffee.notas || 'No hay notas de cata disponibles para este lote.'}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
