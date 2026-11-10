import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Logo, NavPanel } from '@/shared/ui';
import { adminActual, BotonSalir } from '@/modules/identidad';

export const dynamic = 'force-dynamic';

const SECCIONES = [
  { href: '/panel/reservas', etiqueta: 'Agenda' },
  { href: '/panel/configuracion', etiqueta: 'Configuración' },
];

/** Todo lo que está dentro exige un administrador (además de requireAdmin en cada acción). */
export default async function LayoutProtegido({ children }: { children: React.ReactNode }) {
  const admin = await adminActual();
  if (!admin) redirect('/panel/ingresar');

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-outline-soft/60 bg-surface/85 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/panel/reservas" className="flex items-center gap-2.5">
            <Logo size={30} decorative />
            <span className="font-serif text-lg text-on-surface">Panel</span>
          </Link>
          <div className="order-3 w-full sm:order-none sm:w-auto sm:flex-1">
            <NavPanel items={SECCIONES} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden md:inline text-xs text-on-surface-muted truncate max-w-48">{admin.email}</span>
            <BotonSalir />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 sm:px-8 py-8 sm:py-10">{children}</main>
    </>
  );
}
