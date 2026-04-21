'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Coffee } from '@/types';
import {
  Loader2, ArrowLeft, MapPin, Mountain, Coffee as CoffeeIcon,
  Sparkles, BookOpen, Clock, Thermometer, Droplets
} from 'lucide-react';
import { departamentos } from '@/data/mapaData';
import { motion } from 'framer-motion';

/* ── Helpers ──────────────────────────────────────────────────── */

const categoryStyle: Record<string, string> = {
  Varietal:  'text-purple-200/80 bg-purple-950/60 ring-1 ring-purple-700/30',
  Culturing: 'text-amber-200/80  bg-amber-950/60  ring-1 ring-amber-700/30',
  Regional:  'text-on-surface-soft bg-surface-high/60 ring-1 ring-outline-soft/25',
};

function Chip({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${className}`}>
      {children}
    </span>
  );
}

/* ── Bento block base ─────────────────────────────────────────── */
function BentoBlock({ children, className = '', style = {} }: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`rounded-2xl p-7 md:p-8 ${className}`}
      style={{
        background: 'rgba(28, 27, 27, 0.70)',
        border: '1px solid rgba(77, 70, 53, 0.22)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Section eyebrow ──────────────────────────────────────────── */
function Eyebrow({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <Icon className="w-3.5 h-3.5 text-brand-accent/70" />
      <span className="text-[10px] uppercase tracking-[0.22em] text-brand-accent/70 font-sans font-semibold">
        {label}
      </span>
    </div>
  );
}

/* ── Page component ───────────────────────────────────────────── */
export default function LoteDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [coffee, setCoffee] = useState<Coffee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoffee() {
      const { data } = await supabase
        .from('cafes')
        .select('*')
        .eq('id', id)
        .single();
      if (data) setCoffee(data);
      setLoading(false);
    }
    if (id) fetchCoffee();
  }, [id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  /* ── Not found ── */
  if (!coffee) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-brand-white">
        <h1 className="text-3xl font-serif mb-4 text-on-surface">Lote no encontrado</h1>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-brand-accent hover:text-gold-primary transition-colors tracking-wide"
        >
          ← Volver al mapa
        </button>
      </div>
    );
  }

  const deptoName = departamentos.find(d => d.id === coffee.departamento_id)?.nombre ?? coffee.departamento_id;
  const catStyle = categoryStyle[coffee.categoria] ?? categoryStyle['Regional'];

  /* Tasting note chips */
  const notaChips = coffee.notas
    ? coffee.notas.split(/[,·\-]/).map(n => n.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen text-brand-white relative" style={{ background: '#0E0E0E' }}>
      {/* Background con glow dorado muy sutil */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 30% 20%, #D4AF37 0%, transparent 70%)',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-5 md:px-8 py-10 md:py-16">
        {/* ── Botón volver ── */}
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-outline/70 hover:text-on-surface-soft
            transition-colors mb-10 group text-sm tracking-wide"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Mapa
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* ═══════════════════════════════════════════════════════
              1. Hero header (col-span-2)
          ══════════════════════════════════════════════════════════ */}
          <BentoBlock className="md:col-span-2">
            {/* Chips proceso + categoría */}
            <div className="flex gap-2 flex-wrap mb-6">
              <Chip className="bg-surface-highest/70 text-on-surface-soft ring-1 ring-outline-soft/25">
                {coffee.proceso}
              </Chip>
              <Chip className={catStyle}>
                {coffee.categoria}
              </Chip>
            </div>

            {/* Nombre del lote */}
            <h1 className="font-serif font-medium text-5xl md:text-6xl text-on-surface leading-tight tracking-tight mb-3">
              {coffee.nombre}
            </h1>
            {/* Finca */}
            <p className="text-xl text-brand-accent/80 font-serif italic mb-6">
              {coffee.finca}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-5 text-sm text-on-surface-soft/60">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-accent/50 shrink-0" />
                <span>{deptoName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-brand-accent/50 shrink-0" />
                <span>{coffee.altura}</span>
              </div>
            </div>
          </BentoBlock>

          {/* ═══════════════════════════════════════════════════════
              2. Tasting Notes
          ══════════════════════════════════════════════════════════ */}
          <BentoBlock
            className="flex flex-col justify-between"
            style={{
              background: 'rgba(28,27,27,0.55)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(212,175,55,0.12)',
            }}
          >
            <Eyebrow icon={Sparkles} label="Perfil de Taza" />
            {/* Chips de notas */}
            {notaChips.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {notaChips.map((note, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-full text-[10px] tracking-wide
                      bg-surface-highest/80 text-on-surface-soft/70 ring-1 ring-outline-soft/20"
                  >
                    {note}
                  </span>
                ))}
              </div>
            )}
            <p className="text-on-surface-soft/80 leading-relaxed italic text-sm">
              &ldquo;{coffee.notas || 'Perfil equilibrado con notas sutiles.'}&rdquo;
            </p>
          </BentoBlock>

          {/* ═══════════════════════════════════════════════════════
              3. Historia del lote (col-span-2)
          ══════════════════════════════════════════════════════════ */}
          <BentoBlock className="md:col-span-2">
            <Eyebrow icon={BookOpen} label="Historia y Detalles del Lote" />
            <p className="text-on-surface-soft/80 leading-relaxed text-base whitespace-pre-line">
              {coffee.descripcion_larga ??
                `Este exclusivo lote proveniente de la finca ${coffee.finca} representa la excelencia del café en ${deptoName}. Un proceso de ${coffee.proceso} meticuloso que resalta las mejores cualidades de su variedad botánica.`}
            </p>
          </BentoBlock>

          {/* ═══════════════════════════════════════════════════════
              4. Fotografía 1
          ══════════════════════════════════════════════════════════ */}
          <div
            className="aspect-square md:aspect-auto rounded-2xl overflow-hidden relative group"
            style={{
              background: 'rgba(20,19,19,0.60)',
              border: '1px dashed rgba(77,70,53,0.30)',
              minHeight: '180px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/coffees/${coffee.id}/photo1.jpg`}
              alt={coffee.nombre}
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-300 p-5">
              <div className="w-10 h-10 rounded-full bg-surface-highest/40 flex items-center justify-center mb-2">
                <CoffeeIcon className="w-5 h-5 text-outline/50" />
              </div>
              <p className="text-[10px] text-outline/50 uppercase tracking-widest text-center">Fotografía del Lote</p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              5. Preparación sugerida
          ══════════════════════════════════════════════════════════ */}
          <BentoBlock
            className="md:col-span-1"
            style={{
              background: 'linear-gradient(135deg, rgba(212,175,55,0.06) 0%, rgba(28,27,27,0.70) 60%)',
              border: '1px solid rgba(212,175,55,0.14)',
            }}
          >
            <Eyebrow icon={CoffeeIcon} label="Preparación Sugerida" />
            {coffee.metodo_sugerido && (
              <div className="flex items-center gap-2 text-brand-accent font-serif text-base mb-4">
                <CoffeeIcon className="w-4 h-4 shrink-0" />
                <span>{coffee.metodo_sugerido}</span>
              </div>
            )}
            {coffee.preparacion ? (
              <p className="text-on-surface-soft/75 leading-relaxed text-sm whitespace-pre-line">
                {coffee.preparacion}
              </p>
            ) : (
              <div className="space-y-3 text-sm text-on-surface-soft/60">
                <div className="flex items-center gap-2.5">
                  <Droplets className="w-3.5 h-3.5 text-brand-accent/50 shrink-0" />
                  <span>Ratio: 1:15</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-3.5 h-3.5 text-brand-accent/50 shrink-0" />
                  <span>Temperatura: 92°C – 94°C</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-brand-accent/50 shrink-0" />
                  <span>Tiempo: 3:00 – 3:30 min</span>
                </div>
              </div>
            )}
          </BentoBlock>

          {/* ═══════════════════════════════════════════════════════
              6. Fotografía 2
          ══════════════════════════════════════════════════════════ */}
          <div
            className="aspect-square md:aspect-auto rounded-2xl overflow-hidden relative group"
            style={{
              background: 'rgba(20,19,19,0.60)',
              border: '1px dashed rgba(77,70,53,0.30)',
              minHeight: '180px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/images/coffees/${coffee.id}/photo2.jpg`}
              alt="Finca"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center group-hover:opacity-0 transition-opacity duration-300 p-5">
              <div className="w-10 h-10 rounded-full bg-surface-highest/40 flex items-center justify-center mb-2">
                <MapPin className="w-5 h-5 text-outline/50" />
              </div>
              <p className="text-[10px] text-outline/50 uppercase tracking-widest text-center">Sobre la Finca</p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              7. Sugerencias del tostador
          ══════════════════════════════════════════════════════════ */}
          <BentoBlock className="md:col-span-2">
            <Eyebrow icon={Sparkles} label="Sugerencias del Tostador" />
            <p className="text-on-surface-soft/70 leading-relaxed text-sm italic">
              {coffee.sugerencias ??
                'Marida perfectamente con postres cítricos o chocolate con alta concentración de cacao.'}
            </p>
          </BentoBlock>
        </motion.div>
      </div>
    </main>
  );
}
