'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../cn';

export type ItemNav = { href: string; etiqueta: string };

/** Pestañas de navegación con estado activo según la ruta. */
export function NavPanel({ items }: { items: ItemNav[] }) {
  const ruta = usePathname();
  return (
    <nav aria-label="Secciones del panel" className="flex gap-1 overflow-x-auto -mx-1 px-1">
      {items.map((it) => {
        const activo = ruta === it.href || ruta.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={activo ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap rounded-full px-4 h-9 inline-flex items-center text-sm transition-colors',
              activo ? 'bg-primary-soft text-primary font-medium' : 'text-on-surface-muted hover:text-on-surface hover:bg-surface-high',
            )}
          >
            {it.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
