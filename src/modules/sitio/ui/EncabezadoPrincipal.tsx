'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, User, X } from 'lucide-react';
import { Logo, buttonStyles, cn } from '@/shared/ui';

export type EnlaceNav = { href: string; etiqueta: string };

export const ENLACES_SITIO: EnlaceNav[] = [
  { href: '/#experiencias', etiqueta: 'Coffee Tasting' },
  { href: '/mapa', etiqueta: 'Orígenes' },
  { href: '/#historia', etiqueta: 'Historia' },
];

/**
 * Encabezado del sitio público: transparente sobre la portada y sólido
 * (con desenfoque) al hacer scroll. En móvil, menú desplegable.
 */
export function EncabezadoPrincipal({
  enlaces = ENLACES_SITIO,
  transparenteArriba = false,
}: {
  enlaces?: EnlaceNav[];
  /** Solo en portadas con foto: transparente hasta hacer scroll. */
  transparenteArriba?: boolean;
}) {
  const [solido, setSolido] = useState(false);
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    const alDesplazar = () => setSolido(window.scrollY > 24);
    alDesplazar();
    window.addEventListener('scroll', alDesplazar, { passive: true });
    return () => window.removeEventListener('scroll', alDesplazar);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300',
        solido || abierto || !transparenteArriba
          ? 'bg-surface/85 backdrop-blur-md border-b border-outline-soft/60'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-18 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="El Depósito — inicio">
          <Logo size={36} decorative />
          <span className="font-serif text-lg text-on-surface tracking-wide">El Depósito</span>
        </Link>

        <nav aria-label="Principal" className="hidden md:flex items-center gap-8">
          {enlaces.map((e) => (
            <a key={e.href} href={e.href} className="text-sm text-on-surface-soft hover:text-on-surface transition-colors">
              {e.etiqueta}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cuenta"
            aria-label="Mi cuenta"
            className="hidden sm:grid w-10 h-10 place-items-center rounded-full text-on-surface-soft hover:text-on-surface hover:bg-surface-high/60 transition-colors"
          >
            <User className="w-5 h-5" />
          </Link>
          <Link href="/reservar" className={buttonStyles('primary', 'sm')}>
            Reservar
          </Link>
          <button
            type="button"
            onClick={() => setAbierto((a) => !a)}
            aria-expanded={abierto}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden w-10 h-10 grid place-items-center rounded-full text-on-surface hover:bg-surface-high/60 cursor-pointer"
          >
            {abierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {abierto && (
        <nav aria-label="Principal (móvil)" className="md:hidden border-t border-outline-soft/60 px-5 py-4 animate-aparecer">
          <ul className="space-y-1">
            {[...enlaces, { href: '/cuenta', etiqueta: 'Mi cuenta' }].map((e) => (
              <li key={e.href}>
                <a
                  href={e.href}
                  onClick={() => setAbierto(false)}
                  className="block rounded-[var(--radius-md)] px-3 py-3 text-on-surface hover:bg-surface-high"
                >
                  {e.etiqueta}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
