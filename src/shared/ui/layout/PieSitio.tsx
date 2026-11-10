import { MapPin, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { NEGOCIO, POLITICA_DATOS, RESPONSABLE_DATOS, enlaceWhatsApp } from '@/shared/config/negocio';

/** Pie de página de las páginas públicas nuevas (v2). */
export function PieSitio() {
  return (
    <footer className="border-t border-outline-soft/60 mt-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between text-sm text-on-surface-muted">
        <p className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent-hover shrink-0" />
          {NEGOCIO.direccion}, {NEGOCIO.ciudad}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link href={POLITICA_DATOS.ruta} className="hover:text-on-surface transition-colors">
            Política de datos
          </Link>
          <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-on-surface transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-5 sm:px-8 pb-8 text-xs text-on-surface-muted/70">
        {RESPONSABLE_DATOS.razonSocial} · NIT {RESPONSABLE_DATOS.nit}
      </p>
    </footer>
  );
}
