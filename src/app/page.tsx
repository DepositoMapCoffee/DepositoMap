import { Inicio } from '@/modules/sitio';
import { experienciasPublicas } from '@/modules/reservas';
import { vitrinaCatalogo } from '@/modules/catalogo';

/**
 * Página de inicio. Estática: se regenera cada minuto y al guardar una
 * experiencia o un producto en el panel (revalidatePath('/')).
 */
export const revalidate = 60;

export default async function PaginaInicio() {
  const [experiencias, vitrina] = await Promise.all([experienciasPublicas(), vitrinaCatalogo()]);
  return <Inicio experiencias={experiencias} {...vitrina} />;
}
