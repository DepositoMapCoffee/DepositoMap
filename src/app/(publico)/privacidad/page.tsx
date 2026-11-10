import type { Metadata } from 'next';
import { Container } from '@/shared/ui';
import { PoliticaDatos } from '@/modules/legal';

export const metadata: Metadata = {
  title: 'Política de tratamiento de datos | El Depósito',
  description: 'Cómo tratamos tus datos personales al reservar y usar el sitio de El Depósito (Ley 1581 de 2012).',
};

export default function PaginaPrivacidad() {
  return (
    <Container size="xl" className="pt-10 sm:pt-14">
      <PoliticaDatos />
    </Container>
  );
}
