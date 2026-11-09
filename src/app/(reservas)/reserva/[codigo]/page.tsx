import type { Metadata } from 'next';
import Link from 'next/link';
import { Container, buttonStyles } from '@/shared/ui';
import { GestionReserva, reservaParaGestion } from '@/modules/reservas';

// Contiene datos personales: nunca indexar ni cachear.
export const metadata: Metadata = {
  title: 'Tu reserva | El Depósito',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default async function PaginaReserva({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [{ codigo }, { t }] = await Promise.all([params, searchParams]);
  const datos = t ? await reservaParaGestion(decodeURIComponent(codigo), t) : null;

  return (
    <Container size="md" className="pt-12 sm:pt-16">
      {datos ? (
        <GestionReserva reserva={datos.reserva} token={t!} cancelable={datos.cancelable} />
      ) : (
        <div className="max-w-md mx-auto text-center animate-entrar">
          <h1 className="font-serif text-3xl text-on-surface">No encontramos esta reserva</h1>
          <p className="text-on-surface-muted mt-3">
            El enlace está incompleto o no es válido. Usa el enlace exacto de tu confirmación o escríbenos con tu código.
          </p>
          <Link href="/reservar" className={buttonStyles('primary', 'md', 'mt-8')}>
            Hacer una reserva
          </Link>
        </div>
      )}
    </Container>
  );
}
