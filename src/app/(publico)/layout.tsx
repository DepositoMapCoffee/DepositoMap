import { PieSitio } from '@/shared/ui';
import { EncabezadoPrincipal } from '@/modules/sitio';

/** Marco de las páginas públicas internas: reservas, mapa, cuenta, política… */
export default function LayoutPublico({ children }: { children: React.ReactNode }) {
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
      <EncabezadoPrincipal />
      <main className="relative flex-1 pt-18">{children}</main>
      <PieSitio />
    </div>
  );
}
