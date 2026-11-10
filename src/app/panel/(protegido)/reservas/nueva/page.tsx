import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { datosReservaManual, FormReservaManual } from '@/modules/reservas';

export const metadata: Metadata = { title: 'Nueva reserva' };

export default async function PaginaNuevaReserva({ searchParams }: { searchParams: Promise<{ fecha?: string }> }) {
  const [{ fecha }, datos] = await Promise.all([searchParams, datosReservaManual()]);
  return (
    <div className="space-y-8">
      <div>
        <Link href={`/panel/reservas${fecha ? `?dia=${fecha}` : ''}`} className="inline-flex items-center gap-1.5 text-sm text-on-surface-muted hover:text-on-surface">
          <ArrowLeft className="w-4 h-4" /> Agenda
        </Link>
        <h1 className="font-serif text-3xl sm:text-4xl text-on-surface mt-3">Nueva reserva</h1>
        <p className="text-on-surface-muted mt-1">Para reservas que llegan por WhatsApp, teléfono o en persona.</p>
      </div>
      <FormReservaManual experiencias={datos.experiencias} fechaInicial={fecha && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : datos.hoy} />
    </div>
  );
}
