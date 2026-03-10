/**
 * lib/animations.ts
 * ─────────────────────────────────────────────────────────────────
 * Variantes de animación centralizadas para Framer Motion.
 *
 * Al tener todas las animaciones en un solo archivo:
 * - Se eliminan valores hardcodeados en los componentes
 * - Se mantiene coherencia visual en toda la app
 * - Es fácil ajustar timing de un solo lugar
 * ─────────────────────────────────────────────────────────────────
 */

import type { Variants, Transition } from 'framer-motion';

// ─── Curvas de Bézier reutilizables ──────────────────────────────

/** Transición suave estándar */
export const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const;

/** Transición con rebote elegante al entrar */
export const EASE_ELEGANT = [0.16, 1, 0.3, 1] as const;

/** Transición suave para salidas */
export const EASE_EXIT = [0.4, 0, 0.6, 1] as const;

// ─── Spring physics ───────────────────────────────────────────────

/** Spring estándar para movimientos naturales */
const springStandard: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// ─── Panel lateral (SidePanel) ────────────────────────────────────

/**
 * Genera las variantes de animación del panel lateral.
 * - Móvil (<768px): entra desde abajo
 * - Desktop (≥768px): entra desde la derecha
 */
export const getPanelVariants = (): Variants => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return {
    initial: {
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      opacity: 0,
      filter: 'blur(4px)',
    },
    animate: {
      x: 0,
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        ...springStandard,
        filter: { duration: 0.3, ease: EASE_SMOOTH },
        opacity: { duration: 0.3, ease: EASE_SMOOTH },
      },
    },
    exit: {
      x: isMobile ? 0 : '100%',
      y: isMobile ? '100%' : 0,
      opacity: 0,
      filter: 'blur(4px)',
      transition: { duration: 0.25, ease: EASE_EXIT },
    },
  };
};

// ─── Contenedor en stagger (listas de cards) ──────────────────────

/**
 * Hace que los hijos aparezcan en cascada, uno tras otro.
 * Úsalo en el contenedor padre de las CoffeeCards.
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
      when: 'beforeChildren',
    },
  },
};

// ─── Tarjetas individuales (CoffeeCard) ──────────────────────────

/**
 * Cada tarjeta entra con un fade + slide desde abajo.
 * Se usa con staggerContainerVariants en el contenedor padre.
 */
export const cardVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96, filter: 'blur(2px)' },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 24,
      mass: 1,
    },
  },
};

// ─── Paths del mapa SVG (departamentos) ──────────────────────────

/**
 * Propiedades de animación para cada <path> del mapa de Colombia.
 *
 * @param isSelected  - true si el departamento está seleccionado
 * @param isHovered   - true si el puntero está sobre él
 * @param hasData     - true si tiene cafés registrados en Supabase
 * @param deptColor   - color único del departamento (generado por hash)
 */
export const getPathAnimation = (
  isSelected: boolean,
  isHovered: boolean,
  hasData: boolean,
  deptColor: string,
) => {
  /** Color inactivo: gris oscuro para el mapa negro */
  const inactive = '#2A2A2A';
  /** Color activo del departamento (único por hash) */
  const active = deptColor;
  /** Color de selección: blanco roto elegante */
  const selected = '#E8E0D4';

  return {
    initial: { fill: inactive },
    animate: {
      fill: isSelected ? selected : isHovered || hasData ? active : inactive,
      stroke: isSelected ? '#FFFFFF' : '#0D0D0D',
      strokeWidth: isSelected ? 2 : 0.8,
      scale: isSelected ? 1.03 : 1,
      transition: {
        duration: 0.3,
        ease: EASE_SMOOTH,
        scale: { type: 'spring', stiffness: 400, damping: 25 },
      },
    },
    whileHover: {
      scale: hasData ? 1.015 : 1.005,
      transition: { duration: 0.15, ease: EASE_ELEGANT },
    },
  };
};
