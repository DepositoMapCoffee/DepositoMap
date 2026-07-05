'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown, Clock3, Coffee, Globe, MapPin, Users, ArrowRight,
  Quote, Sparkles,
} from 'lucide-react';

/* ─────────────────────────────────────────
   Tipos
────────────────────────────────────────── */
interface ServiciosViewProps {
  onReservationsClick?: () => void;
}

/* ─────────────────────────────────────────
   Constantes — paquetes
────────────────────────────────────────── */
const PAQUETES = [
  {
    id: 'testing_1',
    nombre: 'Coffee Tasting El Depósito',
    precio: '$45.000',
    duracion: '30 min',
    cafes: '3 cafés de especialidad',
    imagen: '/Tasting1.webp',
    descripcion:
      'Una experiencia esencial para quienes quieren descubrir el café de especialidad. Aprende sobre generalidades del café, las características de la caficultura colombiana y la preparación de cafés filtrados mientras degustas tres cafés excepcionales.',
  },
  {
    id: 'testing_2',
    nombre: 'Coffee Tasting El Depósito Completo',
    precio: '$120.000',
    duracion: '60 min',
    cafes: '5 cafés de especialidad',
    imagen: '/Tasting2.webp',
    descripcion:
      'La experiencia más profunda. Perfecta para quienes ya conocen el café especial y quieren ir más allá: origen, procesos de producción, panorama de mercado y una cata de cinco cafés que incluye fermentados con beneficios experimentales y premiados internacionalmente.',
  },
];

/* ─────────────────────────────────────────
   Constantes — equipo
────────────────────────────────────────── */
const EQUIPO = [
  {
    nombre: 'Oscar Mercado',
    iniciales: 'OM',
    placeholder: '/team-oscar.svg',
    frase: 'Cada café cuenta una historia. Mi trabajo es ayudarte a descubrirla.',
  },
  {
    nombre: 'Santiago González',
    iniciales: 'SG',
    placeholder: '/team-santiago.svg',
    frase: 'Honramos el pasado, vivimos el presente y construimos el futuro del café colombiano.',
  },
  {
    nombre: 'Alberto Mendoza',
    iniciales: 'AM',
    placeholder: '/team-alberto.svg',
    frase: 'La calidad no es casualidad. Es el resultado de generaciones de conocimiento.',
  },
];

/* ─────────────────────────────────────────
   Variants de animación
────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const cardReveal = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

/* ─────────────────────────────────────────
   Componente principal
────────────────────────────────────────── */
export default function ServiciosView({ onReservationsClick }: ServiciosViewProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-brand-black">
      {/* ── Scroll container ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden scroll-touch"
      >

        {/* ══════════════════════════════════════════
            SECCIÓN 1 — HERO DE SERVICIOS
        ══════════════════════════════════════════ */}
        <section className="relative min-h-[70dvh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center"
            style={{ backgroundImage: 'url(/Tasting1.webp)' }}
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-black/80 via-brand-black/60 to-brand-black/90" />

          <motion.div
            layout={false}
            initial="hidden"
            animate="show"
            variants={staggerContainer}
            className="flex flex-col items-center text-center max-w-2xl"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 ring-1 ring-brand-accent/20 text-brand-accent text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">
                <Sparkles className="w-3 h-3" />
                Experiencias
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface font-medium tracking-tight mb-4"
            >
              Coffee Tasting
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-on-surface-soft/60 text-sm md:text-base leading-relaxed font-sans max-w-lg mb-8"
            >
              Más que una cata: una experiencia guiada por generaciones de conocimiento
              cafetero. Descubre, aprende y enamórate del café de especialidad colombiano
              en un espacio diseñado para los sentidos.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onReservationsClick}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-sans font-semibold
                  bg-brand-accent text-brand-black hover:bg-verde transition-all duration-300
                  cursor-pointer active:scale-[0.97] shadow-[0_4px_20px_rgba(47,163,107,0.28)]"
              >
                Reservar ahora
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>

          {/* ── Scroll indicator siempre visible ── */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-[8px] uppercase tracking-[0.35em] text-on-surface-soft/30 font-sans">
              Descubre más
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronDown className="w-4 h-4 text-on-surface-soft/30" />
            </motion.div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DIVIDER
        ══════════════════════════════════════════ */}
        <motion.div
          layout={false}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ root: scrollRef, once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-px mx-8 origin-left"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(47,163,107,0.3) 30%, rgba(149,90,35,0.3) 70%, transparent)',
          }}
        />

        {/* ══════════════════════════════════════════
            SECCIÓN 2 — LOS DOS SERVICIOS
        ══════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-6xl mx-auto">
          <motion.div
            layout={false}
            initial="hidden"
            whileInView="show"
            viewport={{ root: scrollRef, once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-[9px] uppercase tracking-[0.4em] text-brand-accent/70 font-sans mb-4">
                Elige tu experiencia
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-medium tracking-tight mb-4">
                Nuestros Coffee Tastings
              </h2>
              <p className="text-on-surface-soft/50 text-sm font-sans max-w-md mx-auto">
                Dos formatos pensados para distintos niveles de conocimiento.
                Ambos guiados por expertos apasionados.
              </p>
              <div className="w-12 h-px bg-brand-accent/40 mx-auto mt-6" />
            </motion.div>

            {/* Cards */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {PAQUETES.map((pkg) => (
                <motion.div
                  key={pkg.id}
                  layout={false}
                  variants={cardReveal}
                  className="group rounded-2xl overflow-hidden
                    border border-outline-soft/20 bg-surface-low/40
                    hover:border-brand-accent/30 transition-all duration-500"
                >
                  {/* Imagen */}
                  <div
                    className="h-52 md:h-60 overflow-hidden bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${pkg.imagen})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-low/90 via-transparent to-transparent" />
                    {/* Badge precio */}
                    <div className="absolute top-4 right-4 px-4 py-2 rounded-xl
                      bg-brand-accent/15 backdrop-blur-md ring-1 ring-brand-accent/25"
                    >
                      <span className="font-sans font-bold text-sm text-brand-accent">
                        {pkg.precio}
                      </span>
                      <span className="text-[9px] text-brand-accent/60 ml-1 font-sans">
                        / persona
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-5 md:p-6 space-y-4">
                    <h3 className="font-serif text-xl md:text-2xl text-on-surface group-hover:text-brand-accent transition-colors duration-300">
                      {pkg.nombre}
                    </h3>
                    <p className="text-on-surface-soft/60 text-sm leading-relaxed font-sans">
                      {pkg.descripcion}
                    </p>

                    {/* Detalles */}
                    <div className="flex flex-wrap gap-3 text-[11px] text-on-surface-soft/50 font-sans">
                      <span className="flex items-center gap-1.5">
                        <Clock3 className="w-3.5 h-3.5" />
                        {pkg.duracion}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Coffee className="w-3.5 h-3.5" />
                        {pkg.cafes}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        Español · English · Português
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={onReservationsClick}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-sans font-semibold
                        bg-brand-accent/10 text-brand-accent ring-1 ring-brand-accent/25
                        hover:bg-brand-accent hover:text-brand-black
                        transition-all duration-300 cursor-pointer active:scale-[0.98]"
                    >
                      Reservar este
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════
            DIVIDER
        ══════════════════════════════════════════ */}
        <motion.div
          layout={false}
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ root: scrollRef, once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="h-px mx-8 origin-left"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(47,163,107,0.3) 30%, rgba(149,90,35,0.3) 70%, transparent)',
          }}
        />

        {/* ══════════════════════════════════════════
            SECCIÓN 3 — NUESTRO EQUIPO
        ══════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
          <motion.div
            layout={false}
            initial="hidden"
            whileInView="show"
            viewport={{ root: scrollRef, once: true, margin: '-80px' }}
            variants={staggerContainer}
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-[9px] uppercase tracking-[0.4em] text-brand-accent/70 font-sans mb-4">
                Nuestro Equipo
              </p>
              <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-medium tracking-tight mb-4">
                Personas apasionadas por el café
              </h2>
              <p className="text-on-surface-soft/50 text-sm font-sans max-w-lg mx-auto">
                Detrás de cada experiencia hay un equipo dedicado a compartir
                el conocimiento de cuatro generaciones.
              </p>
              <div className="w-12 h-px bg-brand-accent/40 mx-auto mt-6" />
            </motion.div>

            {/* Team grid */}
            <div className="grid md:grid-cols-3 gap-8 md:gap-6">
              {EQUIPO.map((persona) => (
                <motion.div
                  key={persona.nombre}
                  layout={false}
                  variants={cardReveal}
                  className="flex flex-col items-center text-center"
                >
                  {/* Foto / placeholder (SVG, no necesita next/image) */}
                  <div className="w-44 h-55 md:w-48 md:h-60 mb-5 rounded-2xl overflow-hidden
                    ring-1 ring-outline-soft/10 bg-surface-low/60 flex items-center justify-center"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={persona.placeholder}
                      alt={persona.nombre}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Quote */}
                  <div className="relative px-4">
                    <Quote className="absolute -top-1 -left-1 w-4 h-4 text-brand-accent/20" />
                    <p className="text-on-surface-soft/60 text-xs md:text-sm leading-relaxed font-sans italic mb-3">
                      &ldquo;{persona.frase}&rdquo;
                    </p>
                  </div>

                  {/* Name */}
                  <p className="font-serif text-base md:text-lg text-on-surface font-medium">
                    {persona.nombre}
                  </p>
                  <p className="text-[9px] uppercase tracking-[0.25em] text-brand-accent/50 font-sans mt-1">
                    El Depósito 1928
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section className="px-6 pb-20 max-w-2xl mx-auto text-center">
          <motion.div
            layout={false}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ root: scrollRef, once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-12 h-px bg-brand-accent/40 mx-auto mb-8" />
            <h3 className="font-serif text-2xl md:text-3xl text-on-surface font-medium tracking-tight mb-4">
              ¿Listo para la experiencia?
            </h3>
            <p className="text-on-surface-soft/50 text-sm font-sans mb-8 max-w-md mx-auto">
              Reserva tu Coffee Tasting y descubre por qué cuatro generaciones
              de conocimiento hacen la diferencia.
            </p>
            <button
              onClick={onReservationsClick}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-sans font-semibold
                bg-brand-accent text-brand-black hover:bg-verde transition-all duration-300
                cursor-pointer active:scale-[0.97] shadow-[0_4px_20px_rgba(47,163,107,0.28)]"
            >
              Reservar ahora
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </section>

        {/* Footer spacer */}
        <div className="h-12 md:h-6" />
      </div>
    </div>
  );
}
