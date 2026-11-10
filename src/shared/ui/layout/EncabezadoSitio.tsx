import Link from 'next/link';
import { Logo } from '../brand/Logo';

/** Encabezado de las páginas públicas nuevas (v2). */
export function EncabezadoSitio({ accion }: { accion?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-outline-soft/60 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="El Depósito — inicio">
          <Logo size={34} decorative className="transition-transform duration-300 group-hover:scale-105" />
          <span className="font-serif text-lg text-on-surface tracking-wide">El Depósito</span>
        </Link>
        {accion}
      </div>
    </header>
  );
}
