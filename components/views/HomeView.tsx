'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Map, LogIn, UserPlus, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface HomeViewProps {
  onMapClick: () => void;
  onUserClick: () => void;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0  },
};

export default function HomeView({ onMapClick, onUserClick }: HomeViewProps) {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* ── Ambient glow verde ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 45% at 50% 42%, rgba(47,163,107,0.06) 0%, transparent 70%)',
        }}
      />

      <motion.div
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12 } } }}
        initial="hidden"
        animate="show"
        className="flex flex-col items-center w-full max-w-sm z-10"
      >
        {/* ── Isotipo ── */}
        <motion.div variants={fadeUp} className="mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Isotipo.svg"
            alt=""
            aria-hidden="true"
            className="w-16 h-16 drop-shadow-[0_0_18px_rgba(47,163,107,0.18)]"
          />
        </motion.div>

        {/* ── Logo wordmark ── */}
        <motion.div variants={fadeUp} className="mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.svg"
            alt="El Depósito"
            className="h-16 md:h-20 w-auto"
          />
        </motion.div>

        {/* ── Tagline ── */}
        <motion.p
          variants={fadeUp}
          className="text-[10px] uppercase tracking-[0.4em] text-on-surface-soft/35 font-sans mb-14 text-center"
        >
          Specialty Coffee · Colombia
        </motion.p>

        {/* ── Botones ── */}
        <motion.div variants={fadeUp} className="flex flex-col gap-3 w-full">

          {!session ? (
            <>
              {/* Iniciar sesión — primario */}
              <button
                onClick={onUserClick}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl
                  bg-brand-accent text-brand-black font-sans font-semibold text-sm tracking-wide
                  hover:bg-verde transition-all duration-300 cursor-pointer
                  shadow-[0_4px_20px_rgba(47,163,107,0.25)]
                  hover:shadow-[0_6px_28px_rgba(47,163,107,0.35)]
                  active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </button>

              {/* Registro — secundario (ghost) */}
              <button
                onClick={onUserClick}
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl
                  bg-transparent text-on-surface font-sans font-medium text-sm tracking-wide
                  border border-outline-soft/40 hover:border-brand-accent/50
                  hover:text-brand-accent hover:bg-brand-accent/5 cursor-pointer
                  transition-all duration-300 active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                Registro
              </button>

              {/* Separador con texto */}
              <div className="flex items-center gap-3 my-1">
                <span className="flex-1 h-px bg-outline-soft/25" />
                <span className="text-[10px] uppercase tracking-widest text-on-surface-soft/30 font-sans">
                  o
                </span>
                <span className="flex-1 h-px bg-outline-soft/25" />
              </div>
            </>
          ) : (
            <button
              onClick={onUserClick}
              className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl
                bg-surface-high/50 text-brand-accent font-sans font-medium text-sm tracking-wide
                border border-outline-soft/20 hover:border-brand-accent/50 hover:bg-brand-accent/10
                transition-all duration-300 cursor-pointer mb-2"
            >
              Ir a mi perfil
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {/* Acceso al Mapa — terciario (link) */}
          <button
            onClick={onMapClick}
            className={`flex items-center justify-center gap-2.5 w-full py-3 rounded-xl
              text-on-surface-soft/60 font-sans text-sm tracking-wide
              hover:text-brand-accent transition-colors duration-300 cursor-pointer group
              ${session ? 'bg-surface-low/50 border border-outline-soft/10 mt-2' : ''}`}
          >
            <Map className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            Explorar el Mapa
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
