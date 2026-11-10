import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Logo } from '@/shared/ui';
import { adminActual, FormIngreso } from '@/modules/identidad';

export const metadata: Metadata = { title: 'Ingresar' };
export const dynamic = 'force-dynamic';

export default async function PaginaIngresar() {
  if (await adminActual()) redirect('/panel/reservas');

  return (
    <main className="min-h-dvh grid place-items-center px-5 py-16">
      <div className="w-full max-w-sm animate-entrar">
        <div className="flex flex-col items-center text-center mb-10">
          <Logo size={56} />
          <h1 className="font-serif text-3xl text-on-surface mt-5">Panel El Depósito</h1>
          <p className="text-on-surface-muted mt-2 text-sm">Reservas, horarios y experiencias.</p>
        </div>
        <div className="rounded-[var(--radius-xl)] border border-outline-soft bg-surface-container p-6 shadow-[var(--shadow-card)]">
          <FormIngreso />
        </div>
      </div>
    </main>
  );
}
