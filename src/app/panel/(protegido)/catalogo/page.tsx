import type { Metadata } from 'next';
import { CatalogoAdmin, datosCatalogoAdmin } from '@/modules/catalogo';

export const metadata: Metadata = { title: 'Catálogo' };

export default async function PaginaCatalogo() {
  const { productos } = await datosCatalogoAdmin();
  return <CatalogoAdmin productos={productos} />;
}
