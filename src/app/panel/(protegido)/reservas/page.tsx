import type { Metadata } from 'next';
import { Agenda, datosAgenda } from '@/modules/reservas';

export const metadata: Metadata = { title: 'Agenda' };

export default async function PaginaAgenda({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia } = await searchParams;
  const datos = await datosAgenda(dia);
  return <Agenda {...datos} />;
}
