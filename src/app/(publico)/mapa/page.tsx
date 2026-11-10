import type { Metadata } from 'next';
import { Container } from '@/shared/ui';
import { MapaOrigenes, productosDelMapa } from '@/modules/catalogo';
import { estadoSesion } from '@/modules/identidad';

export const metadata: Metadata = {
  title: 'Mapa de orígenes | El Depósito',
  description: 'Explora en el mapa de Colombia las regiones, fincas y notas de cata de los cafés de especialidad de El Depósito.',
};
// Estática, regenerada cada minuto: los cambios del catálogo se ven enseguida.
export const revalidate = 60;

export default async function PaginaMapa({ searchParams }: { searchParams: Promise<{ region?: string }> }) {
  const [{ region }, productos] = await Promise.all([searchParams, productosDelMapa()]);
  return (
    <Container size="xl" className="pt-10 sm:pt-14">
      <header className="max-w-2xl mb-10 sm:mb-14 animate-entrar">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">Orígenes</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4">Cada café cuenta de dónde viene</h1>
        <p className="text-on-surface-soft mt-4 text-lg leading-relaxed">
          Elige una región en el mapa para conocer sus fincas, procesos y notas de cata.
        </p>
      </header>
      <MapaOrigenes productos={productos} regionInicial={region} estadoSesion={estadoSesion} />
    </Container>
  );
}
