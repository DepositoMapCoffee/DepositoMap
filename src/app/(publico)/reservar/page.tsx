import type { Metadata } from 'next';
import { Container } from '@/shared/ui';
import { datosParaReservar, FlujoReserva, obtenerCalendario } from '@/modules/reservas';

export const metadata: Metadata = {
  title: 'Reserva tu Coffee Tasting | El Depósito',
  description:
    'Reserva en línea tu experiencia de café de especialidad en El Depósito, Cartagena. Elige fecha, horario y número de personas.',
};

// La disponibilidad cambia con cada reserva: siempre datos frescos.
export const dynamic = 'force-dynamic';

export default async function PaginaReservar({ searchParams }: { searchParams: Promise<{ experiencia?: string }> }) {
  const { experiencia } = await searchParams;
  const datos = await datosParaReservar();
  const calendarioInicial = await obtenerCalendario(datos.hoy.slice(0, 7));

  return (
    <Container size="xl" className="pt-10 sm:pt-14">
      <div className="max-w-2xl mb-10 sm:mb-12 animate-entrar">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">Coffee Tasting · Cartagena</p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mt-4 text-on-surface">
          Reserva tu <em className="italic text-primary">experiencia</em> de café
        </h1>
        <p className="text-on-surface-soft mt-4 text-lg leading-relaxed">
          Catas guiadas de café de especialidad colombiano en pleno Barrio San Diego. Elige tu experiencia y el momento:
          nosotros ponemos el café.
        </p>
      </div>

      <FlujoReserva
        experiencias={datos.experiencias}
        experienciaInicial={experiencia}
        hoy={datos.hoy}
        diasMaxFuturo={datos.diasMaxFuturo}
        cuposMaxPorReserva={datos.cuposMaxPorReserva}
        calendarioInicial={calendarioInicial}
        zona={datos.zona}
      />
    </Container>
  );
}
