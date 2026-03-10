'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Mountain, Coffee as CoffeeIcon } from 'lucide-react';
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
      case 'Varietal': return 'bg-purple-900/40 text-purple-200 border-purple-800/50';
      case 'Culturing': return 'bg-amber-900/40 text-amber-200 border-amber-800/50';
      default: return 'bg-brand-gray-light text-brand-cream border-brand-gray';
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => router.push(`/lote/${coffee.id}`)}
      className="bg-brand-gray rounded-xl p-5 border border-brand-gray-light shadow-lg hover:border-brand-accent transition-colors duration-300 group cursor-pointer"
    >
      {/* Header: Title and Category */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-serif text-xl text-brand-white group-hover:text-brand-accent transition-colors">
          {coffee.nombre}
        </h3>
        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full border ${getCategoryColor(coffee.categoria)}`}>
          {coffee.categoria}
        </span>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm text-gray-300">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-accent opacity-70" />
          <span className="truncate" title={coffee.finca}>{coffee.finca}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="w-4 h-4 text-brand-accent opacity-70" />
          <span>{coffee.altura}</span>
        </div>
        <div className="col-span-2 flex items-center gap-1.5">
          <CoffeeIcon className="w-4 h-4 text-brand-accent opacity-70" />
          <span className="text-brand-cream">{coffee.proceso}</span>
        </div>
      </div>

      {/* Tasting notes */}
      <div className="pt-3 border-t border-brand-gray-light">
        <p className="text-xs text-gray-400 italic line-clamp-2 leading-relaxed">
          "{coffee.notas}"
        </p>
      </div>
    </motion.div>
  );
}
