'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Coffee as CoffeeIcon, ArrowRight } from 'lucide-react';
import { Coffee } from '@/types';
import { cardVariants } from '@/lib/animations';

interface CoffeeCardProps {
  coffee: Coffee;
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  const router = useRouter();

  // Helper para asignar color a la categoría
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Varietal': return 'bg-purple-950/40 text-purple-300 border-purple-800/30';
      case 'Culturing': return 'bg-amber-950/40 text-amber-300 border-amber-800/30';
      default: return 'bg-brand-gray-light/50 text-brand-cream border-brand-gray-light';
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => router.push(`/lote/${coffee.id}`)}
      className="relative bg-brand-gray/80 rounded-xl p-5 border border-brand-gray-light shadow-lg hover:shadow-2xl hover:border-brand-accent/50 hover:bg-brand-gray transition-all duration-300 group cursor-pointer overflow-hidden"
    >
      {/* Decorative gradient appearing on hover */}
      <div className="absolute inset-0 bg-linear-to-br from-brand-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header: Title and Category */}
      <div className="flex justify-between items-start mb-4 relative z-10">
        <h3 className="font-serif text-xl text-brand-cream group-hover:text-brand-accent transition-colors duration-300 pr-2">
          {coffee.nombre}
        </h3>
        <span className={`shrink-0 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md border ${getCategoryColor(coffee.categoria)} shadow-sm`}>
          {coffee.categoria}
        </span>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4 text-sm text-gray-400 relative z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-accent/80" />
          <span className="truncate group-hover:text-gray-300 transition-colors" title={coffee.finca}>{coffee.finca}</span>
        </div>
        <div className="flex items-center gap-2">
          <Mountain className="w-4 h-4 text-brand-accent/80" />
          <span className="group-hover:text-gray-300 transition-colors">{coffee.altura}</span>
        </div>
        <div className="col-span-2 flex items-center gap-2">
          <CoffeeIcon className="w-4 h-4 text-brand-accent/80" />
          <span className="text-brand-cream/80 group-hover:text-brand-cream transition-colors">{coffee.proceso}</span>
        </div>
      </div>

      {/* Tasting notes & Footer */}
      <div className="pt-4 border-t border-brand-gray-light/50 flex justify-between items-end relative z-10">
        <p className="text-xs text-gray-500 italic line-clamp-2 leading-relaxed pr-4 group-hover:text-gray-400 transition-colors">
          "{coffee.notas}"
        </p>
        <div className="w-6 h-6 rounded-full bg-brand-gray-light/50 flex items-center justify-center shrink-0 group-hover:bg-brand-accent transition-colors duration-300">
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-black transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
