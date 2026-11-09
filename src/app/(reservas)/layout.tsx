import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EncabezadoSitio, PieSitio } from '@/shared/ui';

/** Marco de las páginas del motor de reservas (v2). */
export default function LayoutReservas({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-surface text-on-surface relative">
      {/* Halo de marca: puro CSS, sin imágenes ni JS. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-90"
        style={{
          background:
            'radial-gradient(60% 50% at 15% 0%, rgba(149,90,35,0.18) 0%, transparent 70%), radial-gradient(45% 40% at 90% 10%, rgba(47,163,107,0.10) 0%, transparent 70%)',
        }}
      />
      <EncabezadoSitio
        accion={
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted hover:text-on-surface transition-colors">
            <ArrowLeft className="w-4 h-4" /> Volver al sitio
          </Link>
        }
      />
      <main className="relative flex-1">{children}</main>
      <PieSitio />
    </div>
  );
}
