'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCoffeeStore } from '@/store/coffeeStore';
import { getPathAnimation } from '@/lib/animations';
import { departamentos } from '@/data/mapaData';

/**
 * Función de utilidad para generar un color consistente basado
 * en el ID del departamento.
 */
function getHashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  const saturation = 40 + Math.abs((hash >> 8) % 30);
  const lightness = 40 + Math.abs((hash >> 16) % 15);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export default function MapaColombia() {
  const { selectedDept, selectDept, activeDepts, clearSelection } = useCoffeeStore();
  const [hoveredDept, setHoveredDept] = React.useState<string | null>(null);

  // Memorizamos los colores para no recalcular en cada randerizado
  const deptColors = useMemo(() => {
    const colors: Record<string, string> = {};
    departamentos.forEach((dept) => {
      colors[dept.id] = getHashColor(dept.id);
    });
    return colors;
  }, []);

  const handleDeptClick = (deptId: string, hasData: boolean) => {
    if (hasData) {
      if (selectedDept === deptId) {
        clearSelection();
      } else {
        selectDept(deptId);
      }
    }
  };

  return (
    <div className="w-full h-full relative flex items-center justify-center p-4">
      {/* Tooltip flotante */}
      {hoveredDept && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 pointer-events-none bg-brand-gray/90 border border-brand-gray-light px-4 py-2 rounded-full shadow-xl backdrop-blur-sm z-10 transition-all duration-300">
          <p className="font-serif text-brand-white m-0 text-lg tracking-wide">
            {departamentos.find(d => d.id === hoveredDept)?.nombre}
          </p>
        </div>
      )}

      {/* SVG del Mapa */}
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full max-h-[85vh] drop-shadow-2xl"
        preserveAspectRatio="xMidYMid meet"
        onClick={() => clearSelection()}
      >
        <g strokeLinecap="round" strokeLinejoin="round" transform="translate(45,-6)">
          {departamentos.map((dept) => {
            const hasData = activeDepts.includes(dept.id);
            const isSelected = selectedDept === dept.id;
            const isHovered = hoveredDept === dept.id;
            const color = deptColors[dept.id];

            // Obtenemos los props de animación centralizados
            const animationProps = getPathAnimation(isSelected, isHovered, hasData, color);

            return (
              <motion.path
                key={dept.id}
                d={dept.path}
                initial={animationProps.initial}
                animate={animationProps.animate}
                whileHover={animationProps.whileHover}
                onMouseEnter={() => setHoveredDept(dept.id)}
                onMouseLeave={() => setHoveredDept(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeptClick(dept.id, hasData);
                }}
                className={`
                  cursor-${hasData ? 'pointer' : 'default'}
                  outline-none focus:outline-none select-none
                `}
                style={{
                  transformOrigin: 'center',
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
