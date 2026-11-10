import type { Metadata } from 'next';
import { Configuracion, datosConfiguracion } from '@/modules/reservas';

export const metadata: Metadata = { title: 'Configuración' };

export default async function PaginaConfiguracion({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const [{ tab }, datos] = await Promise.all([searchParams, datosConfiguracion()]);
  return <Configuracion pestana={tab} {...datos} />;
}
