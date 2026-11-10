import Link from 'next/link';
import { AlertCircle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { buttonStyles, cn } from '@/shared/ui';
import { diaSemana, horaAMinutos, sumarDias, type Fecha } from '../../domain/tiempo';
import { ESTADOS_ACTIVOS, type HorarioAdmin, type ReservaAgenda } from '../../domain/tipos';
import { formatoFechaLarga, formatoHora, formatoPrecio } from '../formato';
import { AutoActualizar } from './AutoActualizar';
import { TarjetaReservaAdmin } from './TarjetaReservaAdmin';

type Props = {
  hoy: Fecha;
  seleccionado: Fecha;
  semana: Fecha[];
  reservas: ReservaAgenda[];
  horarios: HorarioAdmin[];
  pendientes: number;
};

const DIA_CORTO = new Intl.DateTimeFormat('es-CO', { weekday: 'short', timeZone: 'UTC' });
const MES_CORTO = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const aDate = (f: Fecha) => new Date(`${f}T12:00:00Z`);
const esActiva = (r: ReservaAgenda) => ESTADOS_ACTIVOS.includes(r.estado);
const cuenta = (r: ReservaAgenda) => r.estado !== 'cancelada' && r.estado !== 'no_show';

export function Agenda({ hoy, seleccionado, semana, reservas, horarios, pendientes }: Props) {
  const delDia = reservas.filter((r) => r.fecha === seleccionado);
  const personasDia = delDia.filter(cuenta).reduce((s, r) => s + r.cupos, 0);
  const ingresosDia = delDia.filter(cuenta).reduce((s, r) => s + r.cupos * r.precioUnitario, 0);
  const personasSemana = reservas.filter(cuenta).reduce((s, r) => s + r.cupos, 0);

  // Franjas del día: las de horario + horas con reservas fuera de horario.
  const capacidadPorHora = new Map(
    horarios.filter((h) => h.diaSemana === diaSemana(seleccionado)).map((h) => [h.horaInicio, h.capacidad]),
  );
  const horas = [...new Set([...capacidadPorHora.keys(), ...delDia.map((r) => r.horaInicio)])].sort(
    (a, b) => horaAMinutos(a) - horaAMinutos(b),
  );

  const rango = `${MES_CORTO.format(aDate(semana[0]))} – ${MES_CORTO.format(aDate(semana[6]))}`.replace(/\./g, '');

  return (
    <div className="space-y-6">
      <AutoActualizar segundos={60} />

      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl text-on-surface">Agenda</h1>
          <p className="text-on-surface-muted mt-1">{rango}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`?dia=${sumarDias(seleccionado, -7)}`} aria-label="Semana anterior" className={buttonStyles('ghost', 'sm', 'w-9 px-0')}>
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <Link href="?" className={buttonStyles('secondary', 'sm')}>
            Hoy
          </Link>
          <Link href={`?dia=${sumarDias(seleccionado, 7)}`} aria-label="Semana siguiente" className={buttonStyles('ghost', 'sm', 'w-9 px-0')}>
            <ChevronRight className="w-4 h-4" />
          </Link>
          <Link href={`/panel/reservas/nueva?fecha=${seleccionado}`} className={buttonStyles('primary', 'sm', 'ml-2')}>
            <Plus className="w-4 h-4" /> Nueva reserva
          </Link>
        </div>
      </div>

      {pendientes > 0 && (
        <div className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-on-surface">
          <AlertCircle className="w-5 h-5 text-warning shrink-0" />
          {pendientes === 1 ? 'Hay 1 reserva pendiente de confirmar.' : `Hay ${pendientes} reservas pendientes de confirmar.`}
        </div>
      )}

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {semana.map((f) => {
          const personas = reservas.filter((r) => r.fecha === f && esActiva(r)).reduce((s, r) => s + r.cupos, 0);
          const hayPendientes = reservas.some((r) => r.fecha === f && r.estado === 'pendiente');
          const activo = f === seleccionado;
          return (
            <Link
              key={f}
              href={`?dia=${f}`}
              aria-current={activo ? 'date' : undefined}
              className={cn(
                'relative rounded-[var(--radius-md)] border py-2.5 sm:py-3 text-center transition-colors',
                activo ? 'border-primary bg-primary-soft' : 'border-outline-soft bg-surface-container hover:border-outline',
                f < hoy && !activo && 'opacity-55',
              )}
            >
              <span className="block text-[10px] sm:text-xs uppercase tracking-wider text-on-surface-muted">
                {DIA_CORTO.format(aDate(f)).replace('.', '')}
              </span>
              <span className={cn('block font-serif text-xl sm:text-2xl', f === hoy ? 'text-primary' : 'text-on-surface')}>
                {Number(f.slice(8))}
              </span>
              <span className="block text-[10px] sm:text-xs text-on-surface-muted">{personas ? `${personas} pers.` : '—'}</span>
              {hayPendientes && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-warning" aria-label="Con pendientes" />}
            </Link>
          );
        })}
      </div>

      {/* Resumen del día */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Kpi etiqueta="Reservas" valor={String(delDia.filter(cuenta).length)} />
        <Kpi etiqueta="Personas" valor={String(personasDia)} pie={`${personasSemana} en la semana`} />
        <Kpi etiqueta="Ingresos estimados" valor={formatoPrecio(ingresosDia)} acento />
      </div>

      {/* Franjas */}
      <section aria-labelledby="titulo-dia">
        <h2 id="titulo-dia" className="font-serif text-2xl text-on-surface mb-4">
          {formatoFechaLarga(seleccionado)}
          {seleccionado === hoy && <span className="ml-2 text-sm font-sans text-primary align-middle">Hoy</span>}
        </h2>

        {horas.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-outline-soft p-8 text-center text-on-surface-muted">
            No hay horarios ni reservas este día.
          </p>
        ) : (
          <div className="space-y-6">
            {horas.map((hora) => {
              const reservasHora = delDia.filter((r) => r.horaInicio === hora);
              const ocupados = reservasHora.filter(esActiva).reduce((s, r) => s + r.cupos, 0);
              const capacidad = capacidadPorHora.get(hora);
              const porcentaje = capacidad ? Math.min(100, (ocupados / capacidad) * 100) : 100;
              return (
                <div key={hora} className="grid sm:grid-cols-[120px_minmax(0,1fr)] gap-3 sm:gap-5">
                  <div className="sm:pt-1">
                    <p className="font-serif text-xl text-on-surface tabular-nums">{formatoHora(hora)}</p>
                    <p className="text-xs text-on-surface-muted mt-0.5">
                      {capacidad ? `${ocupados}/${capacidad} cupos` : `${ocupados} pers. · fuera de horario`}
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-high overflow-hidden max-w-40" aria-hidden="true">
                      <div
                        className={cn('h-full rounded-full', porcentaje >= 100 ? 'bg-accent-hover' : 'bg-primary')}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-3 min-w-0">
                    {reservasHora.length === 0 ? (
                      <p className="text-sm text-on-surface-muted/70 sm:pt-1.5">Sin reservas</p>
                    ) : (
                      reservasHora.map((r) => <TarjetaReservaAdmin key={r.id} reserva={r} hoy={hoy} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Kpi({ etiqueta, valor, pie, acento }: { etiqueta: string; valor: string; pie?: string; acento?: boolean }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container px-3 sm:px-5 py-3 sm:py-4">
      <p className="text-[11px] sm:text-xs text-on-surface-muted">{etiqueta}</p>
      <p className={cn('font-serif text-xl sm:text-3xl mt-1 tabular-nums truncate', acento ? 'text-accent-hover' : 'text-on-surface')}>
        {valor}
      </p>
      {pie && <p className="text-[11px] text-on-surface-muted mt-0.5 hidden sm:block">{pie}</p>}
    </div>
  );
}
