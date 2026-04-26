'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { useCoffeeStore } from '@/store/coffeeStore';
import { getPathAnimation } from '@/lib/animations';
import { departamentos } from '@/data/mapaData';

/** Colores únicos por departamento — espectro completo 0–360° */
function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue        = Math.abs(hash % 360);
  const saturation = 40 + Math.abs((hash >> 8)  % 30);
  const lightness  = 38 + Math.abs((hash >> 16) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function MapaColombia() {
  const { selectedDept, selectDept, activeDepts, clearSelection } = useCoffeeStore();
  const [hoveredDept, setHoveredDept] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState<string>("260 270 600 760");

  /* Auto-calcula el viewBox exacto a partir del bounding box real de los paths */
  React.useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const g = svg.querySelector('g');
    if (!g) return;
    try {
      const b = (g as SVGGElement).getBBox();
      const pad = 20;
      setViewBox(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
    } catch (_) { /* mantiene el valor fallback */ }
  }, []);

  const deptColors = useMemo(() => {
    const colors: Record<string, string> = {};
    departamentos.forEach((dept) => { colors[dept.id] = getHashColor(dept.id); });
    return colors;
  }, []);

  const handleDeptClick = (deptId: string, hasData: boolean) => {
    if (hasData) {
      selectedDept === deptId ? clearSelection() : selectDept(deptId);
    }
  };

  /* Cuál departamento mostrar en el overlay */
  const displayId   = hoveredDept || selectedDept;
  const displayData = departamentos.find(d => d.id === displayId);
  const hasData     = displayId ? activeDepts.includes(displayId) : false;

  return (
    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">

      {/* ── Vignette radial — spotlight sobre el mapa ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 60% at 50% 50%, transparent 25%, rgba(10,10,10,0.75) 100%)',
        }}
      />

      {/* ── SVG del mapa ── */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full relative z-[5]"
        preserveAspectRatio="xMidYMid meet"
        onClick={() => clearSelection()}
        onMouseLeave={() => setHoveredDept(null)}
      >
        <g strokeLinecap="round" strokeLinejoin="round">
          {departamentos.map((dept) => {
            const isSelected = selectedDept === dept.id;
            const isHovered  = hoveredDept   === dept.id;
            const dHasData   = activeDepts.includes(dept.id);
            const color      = deptColors[dept.id];
            const anim       = getPathAnimation(isSelected, isHovered, dHasData, color);

            return (
              <motion.path
                key={dept.id}
                d={dept.path}
                initial={anim.initial}
                animate={anim.animate}
                whileHover={anim.whileHover}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={(e) => { e.stopPropagation(); handleDeptClick(dept.id, dHasData); }}
                className={`cursor-${dHasData ? 'pointer' : 'default'} outline-none select-none`}
                style={{ transformOrigin: 'center' }}
              />
            );
          })}
        </g>
      </svg>

      {/* ══════════════════════════════════════════════
          CENTER OVERLAY — nombre del departamento
      ══════════════════════════════════════════════ */}
      <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
        <AnimatePresence mode="wait">
          {displayData ? (
            <motion.div
              key={displayId}
              initial={{ opacity: 0, y: 14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit   ={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="text-center px-6"
            >
              {/* Pin icon */}
              <div className="flex justify-center mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center
                  bg-brand-accent/15 border border-brand-accent/35 backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-brand-accent" />
                </div>
              </div>

              {/* Eyebrow */}
              <p className={`text-[9px] uppercase tracking-[0.35em] mb-2.5 font-sans font-semibold
                ${hasData ? 'text-brand-accent' : 'text-on-surface-soft/40'}`}>
                {hasData ? 'Origin Spotlight' : 'Región'}
              </p>

              {/* Nombre del departamento */}
              <h2
                className="font-serif font-medium text-brand-white leading-none
                  text-4xl sm:text-5xl md:text-6xl"
                style={{ textShadow: '0 2px 48px rgba(0,0,0,0.95), 0 0 100px rgba(0,0,0,0.8)' }}
              >
                {displayData.nombre}
              </h2>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>


    </div>
  );
}
