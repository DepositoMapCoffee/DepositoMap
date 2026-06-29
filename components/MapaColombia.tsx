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
  const hue = Math.abs(hash % 360);
  const saturation = 40 + Math.abs((hash >> 8) % 30);
  const lightness = 38 + Math.abs((hash >> 16) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/* ──────────────────────────────────────────────
   Sub-componente memoizado para cada path del mapa
   Solo re-renderiza cuando cambian sus props
   ────────────────────────────────────────────── */
interface DeptPathProps {
  dept: typeof departamentos[0];
  isSelected: boolean;
  isHovered: boolean;
  hasCoffee: boolean;
  color: string;
  isCoffee: boolean;
  onHover: (id: string | null, center: { x: number; y: number } | null) => void;
  onClick: (id: string, hasCoffee: boolean) => void;
}

const DeptPath = React.memo(function DeptPath({
  dept, isSelected, isHovered, hasCoffee, color, isCoffee,
  onHover, onClick,
}: DeptPathProps) {
  const anim = getPathAnimation(isSelected, isHovered, hasCoffee, color, isCoffee);
  const cursorClass = hasCoffee ? 'cursor-pointer' : 'cursor-default';

  return (
    <React.Fragment>
      <motion.path
        d={dept.path}
        initial={anim.initial}
        animate={anim.animate}
        whileHover={anim.whileHover}
        onMouseEnter={(e: any) => {
          try {
            const bbox = (e.target as SVGPathElement).getBBox();
            onHover(dept.id, { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 });
          } catch (_) { onHover(dept.id, null); }
        }}
        onMouseLeave={() => { onHover(null, null); }}
        onClick={(e) => { e.stopPropagation(); onClick(dept.id, hasCoffee); }}
        className={`${cursorClass} outline-none select-none`}
        style={{ transformOrigin: 'center' }}
      />
      {/* Overlay de textura para regiones cafeteras sin datos */}
      {isCoffee && !isSelected && !isHovered && !hasCoffee && (
        <motion.path
          d={dept.path}
          fill="url(#hatched-pattern)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none"
          style={{ transformOrigin: 'center' }}
        />
      )}
    </React.Fragment>
  );
});

export default function MapaColombia() {
  const selectedDept = useCoffeeStore(s => s.selectedDept);
  const selectDept = useCoffeeStore(s => s.selectDept);
  const activeDepts = useCoffeeStore(s => s.activeDepts);
  const clearSelection = useCoffeeStore(s => s.clearSelection);
  const [hoveredDept, setHoveredDept] = React.useState<string | null>(null);
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = React.useState<string>("260 270 600 760");

  const [hoveredCenter, setHoveredCenter] = React.useState<{ x: number, y: number } | null>(null);

  /** 
   * Lista de departamentos que son considerados regiones cafeteras.
   */
  const REGIONES_CAFETERAS = React.useMemo(() => [
    'Antioquia', 'Caldas', 'Risaralda', 'Quindío', 'Tolima', 'Huila', 'Cauca',
    'Nariño', 'Valle Del Cauca', 'Santander', 'Norte De Santander', 'Boyacá',
    'Cundinamarca', 'Magdalena', 'Cesar', 'La Guajira', 'Caquetá', 'Putumayo',
    'Meta', 'Casanare', 'Arauca', 'Guaviare'
  ], []);

  const isCoffeeRegion = React.useCallback((nombre: string) => {
    return REGIONES_CAFETERAS.some(r => r.toLowerCase() === nombre.toLowerCase());
  }, [REGIONES_CAFETERAS]);

  /* Auto-calcula el viewBox exacto respondiendo al tamaño de pantalla */
  React.useEffect(() => {
    const computeViewBox = () => {
      const svg = svgRef.current;
      if (!svg) return;
      const g = svg.querySelector('g');
      if (!g) return;
      try {
        const b = (g as SVGGElement).getBBox();
        // Safari puede retornar {x:0,y:0,w:0,h:0} si el elemento no está pintado aún.
        // Verificamos que el bbox sea válido antes de aplicarlo.
        if (b.width === 0 || b.height === 0) return;
        const isMobile = window.innerWidth < 768;
        // En desktop necesitamos 380px de padding para las súper-tarjetas. En móvil, casi nada.
        const padX = isMobile ? 20 : 380;
        const padY = isMobile ? 40 : 80;
        setViewBox(`${b.x - padX} ${b.y - padY} ${b.width + padX * 2} ${b.height + padY * 2}`);
      } catch (_) { }
    };

    // requestAnimationFrame garantiza que el SVG esté pintado antes de medir.
    // Crítico en Safari que ejecuta efectos antes del primer paint.
    let rafId = requestAnimationFrame(() => {
      computeViewBox();
      // Segundo rAF como seguro adicional para Safari en hardware lento
      rafId = requestAnimationFrame(computeViewBox);
    });

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(computeViewBox);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const deptColors = useMemo(() => {
    const colors: Record<string, string> = {};
    departamentos.forEach((dept) => { colors[dept.id] = getHashColor(dept.id); });
    return colors;
  }, []);

  /* ── Touch gestures para móvil (pan + pinch-zoom) ── */
  const touchState = React.useRef<{
    startX: number; startY: number;
    startDist?: number;
    vbAtStart: number[];
    moved: boolean;
  } | null>(null);

  const handleTouchStart = React.useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchState.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        vbAtStart: viewBox.split(' ').map(Number),
        moved: false,
      };
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current = {
        startX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        startY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        startDist: Math.sqrt(dx * dx + dy * dy),
        vbAtStart: viewBox.split(' ').map(Number),
        moved: false,
      };
    }
  }, [viewBox]);

  const handleTouchMove = React.useCallback((e: React.TouchEvent) => {
    const ts = touchState.current;
    if (!ts) return;

    if (e.touches.length === 1 && !('startDist' in ts)) {
      const dx = e.touches[0].clientX - ts.startX;
      const dy = e.touches[0].clientY - ts.startY;

      // Umbral de 10px para distinguir tap de arrastre
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
        ts.moved = true;
      }
      if (!ts.moved) return;

      const svg = svgRef.current;
      if (!svg) return;
      const scaleX = ts.vbAtStart[2] / svg.clientWidth;
      const scaleY = ts.vbAtStart[3] / svg.clientHeight;
      setViewBox(`${ts.vbAtStart[0] - dx * scaleX} ${ts.vbAtStart[1] - dy * scaleY} ${ts.vbAtStart[2]} ${ts.vbAtStart[3]}`);
    } else if (e.touches.length === 2 && ts.startDist) {
      ts.moved = true;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const scale = ts.startDist / Math.max(dist, 1);

      const newW = Math.max(200, Math.min(5000, ts.vbAtStart[2] * scale));
      const newH = Math.max(200, Math.min(5000, ts.vbAtStart[3] * scale));
      const cx = ts.vbAtStart[0] + ts.vbAtStart[2] / 2;
      const cy = ts.vbAtStart[1] + ts.vbAtStart[3] / 2;

      setViewBox(`${cx - newW / 2} ${cy - newH / 2} ${newW} ${newH}`);
      // Actualizar startDist para zoom continuo
      ts.startDist = dist;
      ts.vbAtStart = viewBox.split(' ').map(Number);
    }
  }, [viewBox]);

  const handleTouchEnd = React.useCallback(() => {
    touchState.current = null;
  }, []);

  /* Handlers estables con useCallback para no romper memo de DeptPath */
  const handleDeptHover = React.useCallback((id: string | null, center: { x: number; y: number } | null) => {
    setHoveredDept(id);
    setHoveredCenter(center);
  }, []);

  const handleDeptClick = React.useCallback((deptId: string, hasCoffee: boolean) => {
    if (hasCoffee) {
      const currentSelected = selectedDept;
      if (currentSelected === deptId) {
        clearSelection();
      } else {
        selectDept(deptId);
      }
    }
  }, [selectedDept, selectDept, clearSelection]);

  /* Cuál departamento mostrar en el overlay */
  // En móviles al tocar (emula hover) o al estar seleccionado
  const displayId = hoveredDept || selectedDept;
  const displayData = departamentos.find(d => d.id === displayId);
  const hasData = displayId ? activeDepts.includes(displayId) : false;

  /* Renderizado de la etiqueta infográfica dinámica (Desktop) */
  const renderDesktopInfographic = () => {
    if (!hoveredCenter || !displayData || !hoveredDept) return null;

    const [vbX, vbY, vbW, vbH] = viewBox.split(' ').map(Number);
    const mapCenterX = vbX + vbW / 2;
    const isLeft = hoveredCenter.x < mapCenterX;

    // La línea horizontal llegará justo hasta el borde del padding
    const endX = isLeft ? vbX + 380 : vbX + vbW - 380;

    // Altura del quiebre (ajustada para que sea un poco más arriba)
    const elbowY = Math.max(vbY + 60, Math.min(vbY + vbH - 200, hoveredCenter.y - 60));

    const color = hasData ? '#2fa36b' : '#E8E0D4';

    // Posición del cuadro de texto para que respire bien (Aumentado de tamaño)
    const textBoxX = isLeft ? endX - 390 : endX + 20;

    const isCoffee = isCoffeeRegion(displayData.nombre);

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
            y={elbowY - 80}
            width="380"
            height="500"
            className="overflow-visible"
          >
            {/*
              xmlns es obligatorio dentro de foreignObject en WebKit/Safari.
              Sin él, el contenido HTML no se renderiza correctamente.
            */}
            <motion.div
              {...{ xmlns: "http://www.w3.org/1999/xhtml" } as any}
              initial={{ opacity: 0, x: isLeft ? 15 : -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 200, damping: 20 }}
              className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10"
              style={{
                background: 'rgba(10,10,10,0.6)',
                /* -webkit-backdrop-filter debe ir ANTES de backdrop-filter en Safari */
                WebkitBackdropFilter: 'blur(20px)',
                backdropFilter: 'blur(20px)',
                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
              }}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-brand-accent shadow-[0_0_10px_rgba(47,163,107,0.8)]' : isCoffee ? 'bg-brand-accent/60' : 'bg-on-surface-soft/40'}`} />
                <p className={`text-sm uppercase tracking-[0.2em] font-sans font-bold ${hasData ? 'text-brand-accent' : isCoffee ? 'text-brand-accent/80' : 'text-on-surface-soft/60'}`}>
                  {hasData ? 'Origen Disponible' : isCoffee ? 'Región Cafetera' : 'Departamento de Colombia'}
                </p>
              </div>
              <h3 className="font-serif text-[64px] text-brand-white leading-none tracking-tight">
                {displayData.nombre}
              </h3>
              <p className="text-xl text-on-surface-soft/90 leading-relaxed font-sans mt-2">
                {displayData.descripcion || 'Territorio con una riqueza natural única y una biodiversidad que define la identidad de nuestro país.'}
              </p>
            </motion.div>
          </foreignObject>
        </motion.g>
      </AnimatePresence>
    );
  };

  return (
    <div
      className="w-full h-full relative flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── Vignette radial — spotlight sobre el mapa ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 60% at 50% 50%, transparent 25%, rgba(10,10,10,0.75) 100%)',
        }}
      />

      {/* ── Logo del negocio flotante (Esquina superior derecha) ── */}
      <div className="absolute top-10 right-10 z-20 hidden md:flex flex-col items-end pointer-events-none opacity-[0.85] drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
        <img
          src="/Logo.svg"
          alt="El Depósito"
          className="h-20 lg:h-24 w-auto mb-1"
        />
      </div>

      {/* ── SVG del mapa ── */}
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="w-full h-full relative z-[5]"
        preserveAspectRatio="xMidYMid meet"
        onClick={() => clearSelection()}
        onMouseLeave={() => { setHoveredDept(null); setHoveredCenter(null); }}
        style={{ touchAction: 'none' }}
      >
        <defs>
          <pattern id="hatched-pattern" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="3" stroke="rgba(47,163,107,0.15)" strokeWidth="0.5" />
          </pattern>
        </defs>

        <g strokeLinecap="round" strokeLinejoin="round">
          {departamentos.map((dept) => (
            <DeptPath
              key={dept.id}
              dept={dept}
              isSelected={selectedDept === dept.id}
              isHovered={hoveredDept === dept.id}
              hasCoffee={activeDepts.includes(dept.id)}
              color={deptColors[dept.id]}
              isCoffee={isCoffeeRegion(dept.nombre)}
              onHover={handleDeptHover}
              onClick={handleDeptClick}
            />
          ))}
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
              <div className={`w-2.5 h-2.5 rounded-full ${hasData ? 'bg-brand-accent shadow-[0_0_8px_rgba(47,163,107,0.8)]' : isCoffeeRegion(displayData.nombre) ? 'bg-brand-accent/60' : 'bg-on-surface-soft/40'}`} />
              <p className={`text-[10px] uppercase tracking-widest font-sans font-bold ${hasData ? 'text-brand-accent' : isCoffeeRegion(displayData.nombre) ? 'text-brand-accent/80' : 'text-on-surface-soft/60'}`}>
                {hasData ? 'Origen Disponible' : isCoffeeRegion(displayData.nombre) ? 'Región Cafetera' : 'Departamento de Colombia'}
              </p>
            </div>
            <h3 className="font-serif text-3xl text-brand-white mb-2">{displayData.nombre}</h3>
            <p className="text-xs text-on-surface-soft/90 leading-relaxed font-sans line-clamp-3">
              {displayData.descripcion || 'Territorio con una riqueza natural única y una biodiversidad que define la identidad de nuestro país.'}
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
