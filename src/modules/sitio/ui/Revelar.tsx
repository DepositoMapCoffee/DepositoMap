'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/ui';

/**
 * Aparición suave al entrar en pantalla (una sola vez). Sin librerías:
 * IntersectionObserver + transición CSS. Respeta prefers-reduced-motion.
 */
export function Revelar({
  children,
  className,
  retraso = 0,
}: {
  children: React.ReactNode;
  className?: string;
  retraso?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisible(true);
          observador.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${retraso}ms` }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[var(--ease-out-soft)] motion-reduce:transition-none',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 motion-reduce:opacity-100 motion-reduce:translate-y-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
