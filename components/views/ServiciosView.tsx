'use client';

import React, { useEffect, useState } from 'react';
import {
  ChevronDown, Clock3, Coffee, Globe, ArrowRight,
  Quote, Sparkles,
} from 'lucide-react';
import type { ReservationPackageId } from '@/types';
import { PAQUETES, PAQUETES_MARKETING } from '@/data/paquetes';

/* ─────────────────────────────────────────
   Tipos
────────────────────────────────────────── */
interface ServiciosViewProps {
  onSelectPackage?: (packageId: ReservationPackageId) => void;
}

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
   Componente principal — sin Framer Motion
   Animaciones CSS puras para evitar freeze
────────────────────────────────────────── */
export default function ServiciosView({ onSelectPackage }: ServiciosViewProps) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Trigger hero stagger animation on mount
    const t = setTimeout(() => setHeroVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-brand-black">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-touch" style={{ WebkitOverflowScrolling: 'touch' }}>

        {/* ══════════════════════════════════════════
            SECCIÓN 1 — HERO DE SERVICIOS
        ══════════════════════════════════════════ */}
        <section className="relative min-h-[70dvh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/Tasting1.webp)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/80 via-brand-black/60 to-brand-black/90" />

          {/* Contenido del hero — stagger con CSS */}
          <div className="flex flex-col items-center text-center max-w-2xl">
            {/* Badge */}
            <div
              className={`mb-4 transition-all duration-700 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-accent/10 ring-1 ring-brand-accent/20 text-brand-accent text-[10px] uppercase tracking-[0.25em] font-sans font-semibold">
                <Sparkles className="w-3 h-3" />
                Experiencias
              </span>
            </div>

            {/* Title */}
            <h1
              className={`font-serif text-4xl md:text-5xl lg:text-6xl text-on-surface font-medium tracking-tight mb-4 transition-all duration-700 delay-150 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
            >
              Coffee Tasting
            </h1>

            {/* Description */}
            <p
              className={`text-on-surface-soft/60 text-sm md:text-base leading-relaxed font-sans max-w-lg mb-8 transition-all duration-700 delay-300 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
            >
              Más que una cata: una experiencia guiada por generaciones de conocimiento
              cafetero. Descubre, aprende y enamórate del café de especialidad colombiano
              en un espacio diseñado para los sentidos.
            </p>

            {/* CTA */}
            <div
              className={`flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-500 ease-out ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'}`}
            >
              <button
                onClick={() => onSelectPackage?.('testing_1')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-sans font-semibold
                  bg-brand-accent text-brand-black hover:bg-verde transition-all duration-300
                  cursor-pointer active:scale-[0.97] shadow-[0_4px_20px_rgba(47,163,107,0.28)]"
              >
                Reservar ahora
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-[8px] uppercase tracking-[0.35em] text-on-surface-soft/30 font-sans">
              Descubre más
            </span>
            <ChevronDown className="w-4 h-4 text-on-surface-soft/30 animate-bounce" />
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DIVIDER
        ══════════════════════════════════════════ */}
        <div className="h-px mx-8 bg-gradient-to-r from-transparent via-brand-accent/30 to-transparent" />

        {/* ══════════════════════════════════════════
            SECCIÓN 2 — LOS DOS SERVICIOS
        ══════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {PAQUETES.map((pkg) => {
              const mkt = PAQUETES_MARKETING[pkg.id];
              return (
              <div
                key={pkg.id}
                className="group rounded-2xl overflow-hidden
                  border border-outline-soft/20 bg-surface-low/40
                  hover:border-brand-accent/30 transition-all duration-500"
              >
                {/* Imagen */}
                <div className="relative h-52 md:h-60 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${mkt.imagen})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-low/90 via-transparent to-transparent" />
                  {/* Badge precio */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-xl
                    bg-brand-accent/15 backdrop-blur-md ring-1 ring-brand-accent/25"
                  >
                    <span className="font-sans font-bold text-sm text-brand-accent">
                      {'$' + pkg.precio.toLocaleString('es-CO')}
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
                    {mkt.descripcionLarga}
                  </p>

                  {/* Detalles */}
                  <div className="flex flex-wrap gap-3 text-[11px] text-on-surface-soft/50 font-sans">
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="w-3.5 h-3.5" />
                      {pkg.duracion} min
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5" />
                      {mkt.cafesCorto}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      Español · English · Português
                    </span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => onSelectPackage?.(pkg.id)}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-sans font-semibold
                      bg-brand-accent/10 text-brand-accent ring-1 ring-brand-accent/25
                      hover:bg-brand-accent hover:text-brand-black
                      transition-all duration-300 cursor-pointer active:scale-[0.98]"
                  >
                    Reservar este
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DIVIDER
        ══════════════════════════════════════════ */}
        <div className="h-px mx-8 bg-gradient-to-r from-transparent via-amber-700/30 to-transparent" />

        {/* ══════════════════════════════════════════
            SECCIÓN 3 — NUESTRO EQUIPO
        ══════════════════════════════════════════ */}
        <section className="px-6 md:px-12 py-16 md:py-24 max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
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
          </div>

          {/* Team grid */}
          <div className="grid md:grid-cols-3 gap-8 md:gap-6">
            {EQUIPO.map((persona) => (
              <div
                key={persona.nombre}
                className="flex flex-col items-center text-center"
              >
                {/* Foto / placeholder */}
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
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA FINAL
        ══════════════════════════════════════════ */}
        <section className="px-6 pb-20 max-w-2xl mx-auto text-center">
          <div className="w-12 h-px bg-brand-accent/40 mx-auto mb-8" />
          <h3 className="font-serif text-2xl md:text-3xl text-on-surface font-medium tracking-tight mb-4">
            ¿Listo para la experiencia?
          </h3>
          <p className="text-on-surface-soft/50 text-sm font-sans mb-8 max-w-md mx-auto">
            Reserva tu Coffee Tasting y descubre por qué cuatro generaciones
            de conocimiento hacen la diferencia.
          </p>
          <button
            onClick={() => onSelectPackage?.('testing_1')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-sans font-semibold
              bg-brand-accent text-brand-black hover:bg-verde transition-all duration-300
              cursor-pointer active:scale-[0.97] shadow-[0_4px_20px_rgba(47,163,107,0.28)]"
          >
            Reservar ahora
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Footer spacer */}
        <div className="h-12 md:h-6" />
      </div>
    </div>
  );
}
