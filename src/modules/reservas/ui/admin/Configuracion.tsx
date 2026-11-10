import Link from 'next/link';
import { cn } from '@/shared/ui';
import type { Ajustes, BloqueoAdmin, ExperienciaAdmin, HorarioAdmin } from '../../domain/tipos';
import { ConfigAjustes } from './ConfigAjustes';
import { ConfigBloqueos } from './ConfigBloqueos';
import { ConfigExperiencias } from './ConfigExperiencias';
import { ConfigHorarios } from './ConfigHorarios';

const PESTANAS = [
  { id: 'horarios', titulo: 'Horarios', descripcion: 'Franjas semanales y cupos por franja. La capacidad se comparte entre experiencias.' },
  { id: 'cierres', titulo: 'Cierres', descripcion: 'Días u horarios puntuales sin atención (inventario, eventos, vacaciones).' },
  { id: 'reglas', titulo: 'Reglas', descripcion: 'Cómo y cuándo pueden reservar y cancelar los clientes en línea.' },
  { id: 'experiencias', titulo: 'Experiencias', descripcion: 'Lo que ve el cliente en /reservar: nombres, precios, duración e idiomas.' },
] as const;

export type PestanaConfig = (typeof PESTANAS)[number]['id'];

type Props = {
  pestana?: string;
  hoy: string;
  horarios: HorarioAdmin[];
  bloqueos: BloqueoAdmin[];
  ajustes: Ajustes;
  experiencias: ExperienciaAdmin[];
};

export function Configuracion({ pestana, hoy, horarios, bloqueos, ajustes, experiencias }: Props) {
  const actual = PESTANAS.find((p) => p.id === pestana) ?? PESTANAS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-surface">Configuración</h1>
        <p className="text-on-surface-muted mt-1">{actual.descripcion}</p>
      </div>

      <div className="flex gap-1 border-b border-outline-soft overflow-x-auto overflow-y-hidden" role="tablist">
        {PESTANAS.map((p) => (
          <Link
            key={p.id}
            href={`?tab=${p.id}`}
            role="tab"
            aria-selected={p.id === actual.id}
            className={cn(
              'px-4 h-11 inline-flex items-center text-sm border-b-2 -mb-px whitespace-nowrap transition-colors',
              p.id === actual.id
                ? 'border-primary text-on-surface font-medium'
                : 'border-transparent text-on-surface-muted hover:text-on-surface',
            )}
          >
            {p.titulo}
          </Link>
        ))}
      </div>

      <div role="tabpanel" className="animate-aparecer">
        {actual.id === 'horarios' && <ConfigHorarios horarios={horarios} />}
        {actual.id === 'cierres' && <ConfigBloqueos bloqueos={bloqueos} hoy={hoy} />}
        {actual.id === 'reglas' && <ConfigAjustes ajustes={ajustes} />}
        {actual.id === 'experiencias' && <ConfigExperiencias experiencias={experiencias} />}
      </div>
    </div>
  );
}
