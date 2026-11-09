import { MapPin, MessageCircle } from 'lucide-react';
import { NEGOCIO, enlaceWhatsApp } from '@/shared/config/negocio';

/** Pie de página de las páginas públicas nuevas (v2). */
export function PieSitio() {
  return (
    <footer className="border-t border-outline-soft/60 mt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-on-surface-muted">
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent-hover shrink-0" />
          {NEGOCIO.direccion}, {NEGOCIO.ciudad}
        </p>
        <a
          href={enlaceWhatsApp()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-on-surface transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
      </div>
    </footer>
  );
}
