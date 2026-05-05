'use client';

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { Map, BookOpen, Heart, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/userStore';

interface HomeViewProps {
  onMapClick: () => void;
  onUserClick: () => void;
  onCatalogClick?: () => void;
}

/* ─────────────────────────────────────────
   Animation variants
───────────────────────────────────────── */
const heroContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } },
};

const cardContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

/* ─────────────────────────────────────────
   Access cards config
───────────────────────────────────────── */
const ACCESS_CARDS = [
  {
    id: 'map',
    icon: Map,
    title: 'Mapa Cafetero',
    description: 'Explora los orígenes de nuestros cafés sobre el mapa de Colombia.',
    color: 'verde',
    accent: 'rgba(47,163,107,',
  },
  {
    id: 'catalog',
    icon: BookOpen,
    title: 'Catálogo',
    description: 'Conoce cada lote: variedades, procesos y perfiles de sabor.',
    color: 'marrom',
    accent: 'rgba(149,90,35,',
  },
  {
    id: 'user',
    icon: Heart,
    title: 'Mis Favoritos',
    description: 'Tu pasaporte curador: guarda y revisita los cafés que amas.',
    color: 'verde',
    accent: 'rgba(47,163,107,',
  },
];

/* ─────────────────────────────────────────
   Component
───────────────────────────────────────── */
export default function HomeView({ onMapClick, onUserClick, onCatalogClick }: HomeViewProps) {
  const { session, isLoadingSession } = useUserStore();
  const isotipoControls = useAnimation();

  /* Isotipo: entrada dramática → pulso infinito */
  useEffect(() => {
    isotipoControls.start({
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    }).then(() => {
      isotipoControls.start({
        scale: [1, 1.04, 1],
        transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' },
      });
    });
  }, [isotipoControls]);

  const handleCard = (id: string) => {
    if (id === 'map')     onMapClick();
    if (id === 'user')    onUserClick();
    if (id === 'catalog') onCatalogClick ? onCatalogClick() : undefined;
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">

      {/* ════════════════════════════════════════════
          AMBIENT BACKGROUNDS
      ════════════════════════════════════════════ */}
      {/* Glow verde superior */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 10%, rgba(47,163,107,0.08) 0%, transparent 65%)',
        }}
      />
      {/* Glow marrom inferior */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 95%, rgba(149,90,35,0.07) 0%, transparent 65%)',
        }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ════════════════════════════════════════════
          HERO ZONE — top ~58%
      ════════════════════════════════════════════ */}
      <div className="flex-[0_0_58%] flex flex-col items-center justify-center relative z-10 px-6">

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* ── Isotipo con animación espectacular ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
            animate={isotipoControls}
            className="mb-7 relative"
          >
            {/* Glow ring detrás del isotipo */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.12, 1] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(47,163,107,0.22) 0%, transparent 70%)',
                transform: 'scale(2.4)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Isotipo.svg"
              alt=""
              aria-hidden="true"
              className="relative w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_28px_rgba(47,163,107,0.35)]"
            />
          </motion.div>

          {/* ── Logo wordmark con fade elegante ── */}
          <motion.div
            variants={fadeIn}
            className="mb-4 relative overflow-hidden"
          >
            {/* Shimmer sweep animation */}
            <motion.div
              initial={{ x: '-120%' }}
              animate={{ x: '220%' }}
              transition={{ duration: 1.4, delay: 0.8, ease: 'easeInOut' }}
              className="absolute inset-0 z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 50%, transparent 70%)',
              }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.svg"
              alt="El Depósito"
              className="h-16 md:h-[5.5rem] lg:h-24 w-auto"
            />
          </motion.div>

          {/* ── Tagline poética ── */}
          <motion.p
            variants={fadeUp}
            className="text-[10px] uppercase tracking-[0.45em] text-on-surface-soft/40 font-sans mb-10 text-center"
          >
            Specialty Coffee · Colombia
          </motion.p>

          {/* ── Auth buttons (compactos en la zona hero) ── */}
          <motion.div variants={fadeUp} className="flex gap-3 w-full max-w-xs min-h-[48px]">
            {isLoadingSession ? (
              <div className="w-full flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-brand-accent border-t-transparent animate-spin" />
              </div>
            ) : !session ? (
              <>
                <button
                  onClick={onUserClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-brand-accent text-brand-black font-sans font-semibold text-sm tracking-wide
                    hover:bg-verde transition-all duration-300 cursor-pointer
                    shadow-[0_4px_20px_rgba(47,163,107,0.28)]
                    hover:shadow-[0_6px_30px_rgba(47,163,107,0.4)]
                    active:scale-[0.97]"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </button>
                <button
                  onClick={onUserClick}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl
                    bg-transparent text-on-surface font-sans font-medium text-sm tracking-wide
                    border border-outline-soft/40 hover:border-brand-accent/50
                    hover:text-brand-accent hover:bg-brand-accent/5 cursor-pointer
                    transition-all duration-300 active:scale-[0.97]"
                >
                  <UserPlus className="w-4 h-4" />
                  Registro
                </button>
              </>
            ) : (
              <button
                onClick={onUserClick}
                className="flex items-center justify-center gap-2 w-full max-w-xs py-3 rounded-xl
                  bg-surface-high/50 text-brand-accent font-sans font-medium text-sm tracking-wide
                  border border-outline-soft/20 hover:border-brand-accent/50 hover:bg-brand-accent/10
                  transition-all duration-300 cursor-pointer"
              >
                Mi perfil
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* ════════════════════════════════════════════
          DIVIDER LINE
      ════════════════════════════════════════════ */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="h-px mx-8 origin-left"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(47,163,107,0.3) 30%, rgba(149,90,35,0.3) 70%, transparent)',
        }}
      />

      {/* ════════════════════════════════════════════
          CARDS ZONE — bottom ~42%
      ════════════════════════════════════════════ */}
      <div className="flex-[0_0_42%] flex flex-col justify-center px-5 py-4 relative z-10">

        {/* Label de sección */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-[9px] uppercase tracking-[0.4em] text-on-surface-soft/30 font-sans mb-3 text-center"
        >
          Explorar
        </motion.p>

        {/* Cards grid: 3 columnas en desktop, apiladas en mobile */}
        <motion.div
          variants={cardContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-3 gap-3 md:gap-4 max-w-xl mx-auto w-full"
        >
          {ACCESS_CARDS.map(({ id, icon: Icon, title, description, accent }) => (
            <motion.button
              key={id}
              variants={cardVariant}
              onClick={() => handleCard(id)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              whileTap={{ scale: 0.97 }}
              className="group flex flex-col items-center text-center p-4 md:p-5 rounded-2xl cursor-pointer
                border border-outline-soft/20 hover:border-brand-accent/30
                transition-colors duration-300 relative overflow-hidden"
              style={{ background: 'rgba(17,17,17,0.7)', backdropFilter: 'blur(12px)' }}
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${accent}0.07) 0%, transparent 100%)`,
                }}
              />

              {/* Icon container */}
              <div
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl mb-3
                  transition-all duration-300 group-hover:scale-110"
                style={{
                  background: `${accent}0.12)`,
                  boxShadow: `0 0 0 0 ${accent}0)`,
                }}
              >
                <Icon
                  className="w-5 h-5 md:w-6 md:h-6 transition-colors duration-300"
                  style={{ color: id === 'catalog' ? '#955a23' : '#2fa36b' }}
                />
              </div>

              {/* Title */}
              <span className="font-sans font-semibold text-[11px] md:text-xs text-on-surface tracking-wide mb-1.5 group-hover:text-brand-accent transition-colors duration-300">
                {title}
              </span>

              {/* Description — hidden on very small screens */}
              <span className="hidden md:block font-sans text-[10px] text-on-surface-soft/45 leading-relaxed">
                {description}
              </span>

              {/* Arrow indicator */}
              <ArrowRight
                className="absolute bottom-3 right-3 w-3 h-3 text-on-surface-soft/20
                  group-hover:text-brand-accent group-hover:translate-x-0.5
                  transition-all duration-300 opacity-0 group-hover:opacity-100"
              />
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
