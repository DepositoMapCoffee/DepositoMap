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

/** Pill tags por categoría — color sutil, no saturado */
const categoryConfig: Record<string, { label: string; style: string }> = {
  Varietal:  { label: 'Varietal',  style: 'bg-purple-950/50 text-purple-200/80 ring-1 ring-purple-700/25' },
  Culturing: { label: 'Culturing', style: 'bg-amber-950/50  text-amber-200/80  ring-1 ring-amber-700/25'  },
  Regional:  { label: 'Regional',  style: 'bg-surface-high/70 text-on-surface-soft ring-1 ring-outline-soft/20' },
};

/** Chip de nota de cata — "Tasting Note Chip" del design system */
function TastingChip({ note }: { note: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] tracking-wide
      bg-surface-highest/80 text-on-surface-soft/70 ring-1 ring-outline-soft/20">
      {note.trim()}
    </span>
  );
}

export default function CoffeeCard({ coffee }: CoffeeCardProps) {
  const router = useRouter();
  const cat = categoryConfig[coffee.categoria] ?? categoryConfig['Regional'];

  /* Parsear notas de cata en chips individuales */
  const notaChips = coffee.notas
    ? coffee.notas.split(/[,·\-]/).map(n => n.trim()).filter(Boolean).slice(0, 4)
    : [];

  return (
    <motion.div
      variants={cardVariants}
      onClick={() => router.push(`/lote/${coffee.id}`)}
      className="relative rounded-xl p-5 cursor-pointer overflow-hidden group
        transition-all duration-350
        hover:shadow-[0_4px_30px_rgba(212,175,55,0.08)]"
      style={{
        background: 'rgba(28, 27, 27, 0.85)',
        border: '1px solid rgba(77, 70, 53, 0.22)',
      }}
    >
      {/* Gradient sutil en hover — "Glass & Gradient" rule */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 60%)',
        }}
      />

      {/* Gold Thread vertical al hover */}
      <div className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-brand-accent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* ── Header: nombre + categoría ── */}
      <div className="flex justify-between items-start mb-3 relative z-10">
        <h3 className="font-serif text-[1.15rem] leading-snug text-on-surface
          group-hover:text-gold-primary transition-colors duration-300 pr-2">
          {coffee.nombre}
        </h3>
        <span className={`shrink-0 text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${cat.style}`}>
          {cat.label}
        </span>
      </div>

      {/* ── Detalles ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3.5 text-xs text-outline relative z-10">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-brand-accent/60 shrink-0" />
          <span className="text-on-surface-soft/70 truncate max-w-[130px]" title={coffee.finca}>{coffee.finca}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mountain className="w-3.5 h-3.5 text-brand-accent/60 shrink-0" />
          <span className="text-on-surface-soft/70">{coffee.altura}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CoffeeIcon className="w-3.5 h-3.5 text-brand-accent/60 shrink-0" />
          <span className="text-on-surface-soft/80">{coffee.proceso}</span>
        </div>
      </div>

      {/* ── Tasting Note Chips ── */}
      {notaChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5 relative z-10">
          {notaChips.map((note, i) => (
            <TastingChip key={i} note={note} />
          ))}
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex justify-end relative z-10">
        <div className="w-6 h-6 rounded-full flex items-center justify-center
          bg-surface-highest/60 group-hover:bg-brand-accent
          ring-1 ring-outline-soft/30 group-hover:ring-brand-accent
          transition-all duration-300">
          <ArrowRight className="w-3 h-3 text-outline/70 group-hover:text-surface-lowest transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
