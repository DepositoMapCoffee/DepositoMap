'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, useAnimation, type Variants } from 'framer-motion';
import { CalendarClock, Heart, ArrowRight } from 'lucide-react';
import ColombiaIcon from '@/components/ColombiaIcon';


interface HomeViewProps {
  onMapClick: () => void;
  onUserClick: () => void;
  onReservationsClick?: () => void;
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

const sectionTitle: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const cardContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
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
    icon: ColombiaIcon,
    title: 'Mapa Cafetero',
    description: 'Explora los orígenes de nuestros cafés sobre el mapa de Colombia.',
    color: 'verde',
    accent: 'rgba(47,163,107,',
  },
  {
    id: 'reservations',
    icon: CalendarClock,
    title: 'Reservas',
    description: 'Agenda un Coffee Testing y vive la experiencia.',
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
export default function HomeView({ onMapClick, onUserClick, onReservationsClick }: HomeViewProps) {
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
    if (id === 'map')          onMapClick();
    if (id === 'user')         onUserClick();
    if (id === 'reservations' && onReservationsClick) onReservationsClick();
  };

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden scroll-touch relative">

      {/* ════════════════════════════════════════════
          AMBIENT BACKGROUNDS
      ════════════════════════════════════════════ */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 10%, rgba(47,163,107,0.08) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 95%, rgba(149,90,35,0.07) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ════════════════════════════════════════════
          HERO ZONE
      ════════════════════════════════════════════ */}
      <section className="min-h-[60dvh] flex flex-col items-center justify-center relative z-10 px-6 py-16">

        <motion.div
          variants={heroContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center"
        >
          {/* ── Isotipo ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
            animate={isotipoControls}
            className="mb-7 relative"
          >
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

          {/* ── Logo wordmark ── */}
          <motion.div
            variants={fadeIn}
            className="mb-4 relative overflow-hidden"
          >
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

          {/* ── Tagline ── */}
          <motion.p
            variants={fadeUp}
            className="text-[10px] uppercase tracking-[0.45em] text-on-surface-soft/40 font-sans mb-10 text-center"
          >
            Specialty Coffee · Colombia
          </motion.p>

        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          DIVIDER
      ════════════════════════════════════════════ */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="h-px mx-8 origin-left relative z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(47,163,107,0.3) 30%, rgba(149,90,35,0.3) 70%, transparent)',
        }}
      />

      {/* ════════════════════════════════════════════
          NUESTRA HISTORIA
      ════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 py-16 md:py-20 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={sectionTitle}
        >
          <p className="text-[9px] uppercase tracking-[0.4em] text-brand-accent/70 font-sans mb-4 text-center">
            Nuestra Historia
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-on-surface font-medium tracking-tight mb-8 text-center">
            Un legado de cuatro generaciones
          </h2>
          <div className="w-12 h-px bg-brand-accent/40 mx-auto mb-10" />

          {/* ── Historia: imagen + texto ── */}
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-14">
            {/* Imagen del abuelo — optimizada con next/image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              <Image
                src="/sigifredo.png"
                alt="Sigifredo González, fundador de El Depósito"
                width={840}
                height={1140}
                sizes="(max-width: 768px) 320px, 350px"
                className="w-full max-w-[320px] md:max-w-[350px] h-auto rounded-2xl shadow-2xl
                  border border-outline-soft/10"
              />
            </motion.div>

            {/* Texto de la historia */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="space-y-5"
            >
              <p className="text-on-surface-soft/80 text-sm md:text-base leading-relaxed font-sans">
                Todo comenzó en <strong>1942</strong> en{' '}
                <strong>Viterbo, Caldas</strong>, cuando{' '}
                <strong className="text-brand-accent">Sigifredo González</strong> y su padre,{' '}
                <strong className="text-brand-accent">Félix González</strong>, fundaron un depósito de café
                motivados por su pasión por este cultivo y su compromiso con los caficultores de la región.
              </p>
              <p className="text-on-surface-soft/60 text-sm md:text-base leading-relaxed font-sans">
                Más de ocho décadas después,{' '}
                <strong className="text-brand-accent">Javier González</strong> y{' '}
                <strong className="text-brand-accent">Santiago González</strong> continúan ese legado
                familiar a través del café especial, seleccionando cafés excepcionales y acercando a las
                personas una experiencia basada en la calidad, la trazabilidad y el respeto por el origen.
              </p>
              <p className="text-on-surface-soft/60 text-sm md:text-base leading-relaxed font-sans italic">
                "Cada taza honra nuestra historia y celebra el trabajo de quienes hacen posible el café."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          EXPERTOS EN CAFÉ ESPECIAL
      ════════════════════════════════════════════ */}
      <section className="relative z-10 px-6 md:px-12 pb-16 md:pb-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          variants={sectionTitle}
          className="text-center"
        >
          <div className="w-12 h-px bg-brand-accent/40 mx-auto mb-10" />
          <h2 className="font-serif text-2xl md:text-3xl text-on-surface font-medium tracking-tight mb-6">
            Expertos en café especial
          </h2>
          <p className="text-on-surface-soft/60 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            Nuestra experiencia de generaciones en la industria cafetera, combinada con una profunda pasión
            por el café especial, nos ha permitido desarrollar un conocimiento experto en selección, tostión
            y preparación. Creemos que cada café tiene una historia única que merece ser descubierta, por eso
            dominamos los métodos de filtrado que mejor resaltan sus aromas, sabores y matices, transformando
            cada taza en una experiencia auténtica que conecta el origen del café con quienes lo disfrutan.
          </p>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════
          DIVIDER
      ════════════════════════════════════════════ */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="h-px mx-8 origin-left relative z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(47,163,107,0.3) 30%, rgba(149,90,35,0.3) 70%, transparent)',
        }}
      />

      {/* ════════════════════════════════════════════
          ACCESS CARDS
      ════════════════════════════════════════════ */}
      <section className="relative z-10 px-5 py-12 md:py-16">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-[9px] uppercase tracking-[0.4em] text-on-surface-soft/30 font-sans mb-5 text-center"
        >
          Explorar
        </motion.p>

        <motion.div
          variants={cardContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
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
                  style={{ color: id === 'reservations' ? '#955a23' : '#2fa36b' }}
                />
              </div>

              {/* Title */}
              <span className="font-sans font-semibold text-[11px] md:text-xs text-on-surface tracking-wide mb-1.5 group-hover:text-brand-accent transition-colors duration-300">
                {title}
              </span>

              {/* Description */}
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
      </section>

      {/* ════════════════════════════════════════════
          FOOTER SPACER (para safe-area en mobile)
      ════════════════════════════════════════════ */}
      <div className="h-12 md:h-6 relative z-10" />
    </div>
  );
}
