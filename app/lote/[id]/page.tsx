'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Coffee } from '@/types';
import { Loader2, ArrowLeft, MapPin, Mountain, Coffee as CoffeeIcon, Sparkles, BookOpen, Clock, Thermometer, Droplets } from 'lucide-react';
import { departamentos } from '@/data/mapaData';
import { motion } from 'framer-motion';

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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* 1. Header & Main Info (Col-span-2) */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex gap-3 items-center">
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

            <div>
              <h1 className="text-5xl md:text-7xl font-serif font-medium text-brand-cream mb-4 leading-tight">
                {coffee.nombre}
              </h1>
              <p className="text-xl md:text-2xl text-brand-accent/90 font-serif italic">
                {coffee.finca}
              </p>
            </div>

            <div className="flex flex-wrap gap-6 text-gray-400">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-accent/60" />
                <span className="text-lg">{deptoName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mountain className="w-5 h-5 text-brand-accent/60" />
                <span className="text-lg">{coffee.altura}</span>
              </div>
            </div>
          </div>

          {/* 2. Tasting Notes (Side Block) */}
          <div className="bg-brand-gray/40 backdrop-blur-md rounded-3xl p-8 border border-brand-gray-light/50 flex flex-col justify-center">
            <h3 className="font-serif text-xl text-brand-cream mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              Perfil de Taza
            </h3>
            <p className="text-gray-300 leading-relaxed italic text-lg">
              "{coffee.notas || 'Perfil equilibrado con notas sutiles.'}"
            </p>
          </div>

          {/* 3. Long Description (Bento Large) */}
          <div className="md:col-span-2 bg-brand-gray/30 backdrop-blur-sm rounded-3xl p-8 md:p-10 border border-brand-gray-light/30">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-accent/80 mb-6 font-bold flex items-center gap-3">
              <BookOpen className="w-4 h-4" />
              Historia y Detalles del Lote
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                {coffee.descripcion_larga || `Este exclusivo lote proveniente de la finca ${coffee.finca} representa la excelencia del café en ${deptoName}. Un proceso de ${coffee.proceso} meticuloso que resalta las mejores cualidades de su variedad botánica.`}
              </p>
            </div>
          </div>

          {/* 4. Image Placeholder 1 */}
          <div className="aspect-square md:aspect-auto bg-brand-gray/20 rounded-3xl border border-dashed border-brand-gray-light/50 flex flex-col items-center justify-center group overflow-hidden relative">
            <img 
              src={`/images/coffees/${coffee.id}/photo1.jpg`} 
              alt={coffee.nombre}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="text-center p-6 group-hover:opacity-0 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-brand-gray-light/30 flex items-center justify-center mx-auto mb-3">
                <CoffeeIcon className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Fotografía del Lote</p>
            </div>
          </div>

          {/* 5. Preparation (Bento Medium) */}
          <div className="bg-linear-to-br from-brand-accent/10 to-transparent rounded-3xl p-8 border border-brand-accent/20">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-accent mb-6 font-bold flex items-center gap-3">
              <CoffeeIcon className="w-4 h-4" />
              Preparación Sugerida
            </h3>
            {coffee.preparacion ? (
              <div className="space-y-4">
                {coffee.metodo_sugerido && (
                  <div className="flex items-center gap-3 text-brand-accent font-serif text-lg mb-2">
                    <CoffeeIcon className="w-5 h-5" />
                    <span>{coffee.metodo_sugerido}</span>
                  </div>
                )}
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {coffee.preparacion}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {coffee.metodo_sugerido && (
                  <div className="flex items-center gap-3 text-brand-accent font-serif text-lg mb-2">
                    <CoffeeIcon className="w-5 h-5" />
                    <span>{coffee.metodo_sugerido}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Droplets className="w-4 h-4 text-brand-accent/50" />
                  <span>Ratio: 1:15</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Thermometer className="w-4 h-4 text-brand-accent/50" />
                  <span>Temp: 92°C - 94°C</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <Clock className="w-4 h-4 text-brand-accent/50" />
                  <span>Tiempo: 3:00 - 3:30 min</span>
                </div>
              </div>
            )}
          </div>

          {/* 6. Image Placeholder 2 */}
          <div className="aspect-square md:aspect-auto bg-brand-gray/20 rounded-3xl border border-dashed border-brand-gray-light/50 flex flex-col items-center justify-center group overflow-hidden relative">
            <img 
              src={`/images/coffees/${coffee.id}/photo2.jpg`} 
              alt="Finca"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="text-center p-6 group-hover:opacity-0 transition-opacity duration-300">
              <div className="w-12 h-12 rounded-full bg-brand-gray-light/30 flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 uppercase tracking-widest">Sobre la Finca</p>
            </div>
          </div>

          {/* 7. Suggestions (Bento Medium) */}
          <div className="bg-brand-gray/30 backdrop-blur-sm rounded-3xl p-8 border border-brand-gray-light/30">
            <h3 className="text-xs uppercase tracking-[0.2em] text-brand-accent/80 mb-6 font-bold flex items-center gap-3">
              <Sparkles className="w-4 h-4" />
              Sugerencias del Tostador
            </h3>
            <p className="text-gray-400 leading-relaxed text-sm italic">
              {coffee.sugerencias || 'Marida perfectamente con postres cítricos o chocolate con alta concentración de cacao.'}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
