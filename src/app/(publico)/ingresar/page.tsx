import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Container, Logo } from '@/shared/ui';
import { estadoSesion, FormIngreso } from '@/modules/identidad';

export const metadata: Metadata = {
  title: 'Ingresar | El Depósito',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function PaginaIngresar({ searchParams }: { searchParams: Promise<{ siguiente?: string }> }) {
  const { siguiente } = await searchParams;
  const sesion = await estadoSesion();
  if (sesion) redirect(sesion.esAdmin ? (siguiente ?? '/panel/reservas') : '/cuenta');

  return (
    <Container size="sm" className="py-14 sm:py-20">
      <div className="max-w-sm mx-auto animate-entrar">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo size={56} />
          <h1 className="font-serif text-3xl sm:text-4xl text-on-surface mt-5">Bienvenido</h1>
          <p className="text-on-surface-muted mt-2">Tus favoritos, tus reservas y, si eres del equipo, el panel.</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-6 shadow-[var(--shadow-card)]">
          <FormIngreso siguiente={siguiente?.startsWith('/') && !siguiente.startsWith('//') ? siguiente : undefined} />
        </div>
      </div>
    </Container>
  );
}
