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

  const [hoveredCenter, setHoveredCenter] = React.useState<{x: number, y: number} | null>(null);

  /* Auto-calcula el viewBox exacto respondiendo al tamaño de pantalla */
  React.useEffect(() => {
    const updateViewBox = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const g = svg.querySelector('g');
      if (!g) return;
      try {
        const b = (g as SVGGElement).getBBox();
        const isMobile = window.innerWidth < 768;
        // En desktop necesitamos 380px de padding para las súper-tarjetas. En móvil, casi nada.
        const padX = isMobile ? 20 : 380; 
        const padY = isMobile ? 40 : 80;
        setViewBox(`${b.x - padX} ${b.y - padY} ${b.width + padX * 2} ${b.height + padY * 2}`);
      } catch (_) {}
    };

    updateViewBox();
    window.addEventListener('resize', updateViewBox);
    return () => window.removeEventListener('resize', updateViewBox);
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
  // En móviles al tocar (emula hover) o al estar seleccionado
  const displayId   = hoveredDept || selectedDept;
  const displayData = departamentos.find(d => d.id === displayId);
  const hasData     = displayId ? activeDepts.includes(displayId) : false;

  /* Renderizado de la etiqueta infográfica dinámica (Desktop) */
  const renderDesktopInfographic = () => {
    if (!hoveredCenter || !displayData || !hoveredDept) return null;
    
    const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
    const mapCenterX = vbX + vbW / 2;
    const isLeft = hoveredCenter.x < mapCenterX;

    // La línea horizontal llegará justo hasta el borde del padding
    const endX = isLeft ? vbX + 380 : vbX + vbW - 380; 
    
    // Altura del quiebre
    const elbowY = Math.max(vbY + 80, Math.min(vbY + vbH - 180, hoveredCenter.y - 40));

    const color = hasData ? '#2fa36b' : '#E8E0D4';
    
    // Posición del cuadro de texto para que respire bien (Aumentado de tamaño)
    const textBoxX = isLeft ? endX - 390 : endX + 20;

    return (
      <AnimatePresence>
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key={displayData.id}
          className="pointer-events-none hidden md:block" /* Oculto en móviles */
        >
          {/* Línea que sale del centro */}
          <motion.path
            d={`M ${hoveredCenter.x} ${hoveredCenter.y} L ${isLeft ? hoveredCenter.x - 30 : hoveredCenter.x + 30} ${elbowY} L ${endX} ${elbowY}`}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          
          <motion.circle 
            cx={hoveredCenter.x} cy={hoveredCenter.y} r="5" 
            fill={color}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 }}
          />
          
          <circle cx={endX} cy={elbowY} r="3" fill={color} opacity={0.6} />

          {/* Cuadro de texto HTML ampliado para textos grandes */}
          <foreignObject
            x={textBoxX}
            y={elbowY - 60}
            width="380"
            height="500"
            className="overflow-visible"
          >
            <motion.div
              initial={{ opacity: 0, x: isLeft ? 15 : -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col gap-4 p-6 bg-brand-black/60 backdrop-blur-xl rounded-2xl border border-white/10"
              style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-brand-accent shadow-[0_0_10px_rgba(47,163,107,0.8)]' : 'bg-on-surface-soft/40'}`} />
                <p className={`text-sm uppercase tracking-[0.2em] font-sans font-bold ${hasData ? 'text-brand-accent' : 'text-on-surface-soft/60'}`}>
                  {hasData ? 'Origen Disponible' : 'Región Cafetera'}
                </p>
              </div>
              <h3 className="font-serif text-[64px] text-brand-white leading-none tracking-tight">
                {displayData.nombre}
              </h3>
              <p className="text-xl text-on-surface-soft/90 leading-relaxed font-sans mt-2">
                {displayData.descripcion || 'Región productora con un ecosistema biodiverso. Sus microclimas y la dedicación de sus caficultores le otorgan a sus granos un perfil de taza excepcional, reconocido a nivel mundial.'}
              </p>
            </motion.div>
          </foreignObject>
        </motion.g>
      </AnimatePresence>
    );
  };

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
        onMouseLeave={() => { setHoveredDept(null); setHoveredCenter(null); }}
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
                onMouseEnter={(e: any) => {
                  setHoveredDept(dept.id);
                  try {
                    const bbox = e.target.getBBox();
                    setHoveredCenter({ x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 });
                  } catch (_) {}
                }}
                onMouseLeave={() => { setHoveredDept(null); setHoveredCenter(null); }}
                onClick={(e) => { e.stopPropagation(); handleDeptClick(dept.id, dHasData); }}
                className={`cursor-${dHasData ? 'pointer' : 'default'} outline-none select-none`}
                style={{ transformOrigin: 'center' }}
              />
            );
          })}
        </g>
        
        {/* Tooltip Infográfico gigante para Escritorio */}
        {renderDesktopInfographic()}
      </svg>

      {/* ══════════════════════════════════════════════
          MOBILE BOTTOM CARD — Al tocar en el celular
      ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {displayData && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="md:hidden absolute bottom-6 left-4 right-4 z-30
                       bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 
                       rounded-2xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
            onClick={(e) => { e.stopPropagation(); hasData && handleDeptClick(displayData.id, hasData); }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2.5 h-2.5 rounded-full ${hasData ? 'bg-brand-accent shadow-[0_0_8px_rgba(47,163,107,0.8)]' : 'bg-on-surface-soft/40'}`} />
              <p className={`text-[10px] uppercase tracking-widest font-sans font-bold ${hasData ? 'text-brand-accent' : 'text-on-surface-soft/60'}`}>
                {hasData ? 'Origen Disponible' : 'Región Cafetera'}
              </p>
            </div>
            <h3 className="font-serif text-3xl text-brand-white mb-2">{displayData.nombre}</h3>
            <p className="text-xs text-on-surface-soft/90 leading-relaxed font-sans line-clamp-3">
              {displayData.descripcion || 'Región productora con un ecosistema biodiverso. Sus microclimas le otorgan a sus granos un perfil excepcional.'}
            </p>
            {hasData && (
              <p className="text-brand-accent text-[10px] font-semibold tracking-wider uppercase mt-4 flex items-center gap-1">
                Ver cafés disponibles <span className="text-lg leading-none">→</span>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
