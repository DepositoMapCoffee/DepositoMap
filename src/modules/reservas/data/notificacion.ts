/**
 * Datos que el módulo `reservas` ofrece a otros módulos para notificar
 * (correo hoy; WhatsApp o chatbot mañana). Expuestos vía index.ts.
 */
import 'server-only';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/shared/infra/db';
import { publicEnv, serverEnv } from '@/shared/config/env';
import { ahoraEnZona, sumarDias, type Fecha } from '../domain/tiempo';
import { ESTADOS_ACTIVOS, type Canal, type EstadoReserva } from '../domain/tipos';
import { tokenDeGestion } from './repositorio';
import { experiencias, reservas } from './schema';

/** Todo lo necesario para redactar un mensaje sobre una reserva. */
export type ReservaParaNotificar = {
  id: string;
  codigo: string;
  fecha: Fecha;
  horaInicio: string;
  cupos: number;
  idioma: string;
  nombre: string;
  email: string | null;
  telefono: string;
  notas: string | null;
  precioUnitario: number;
  estado: EstadoReserva;
  canal: Canal;
  experiencia: { nombre: string; ubicacion: string; duracionMin: number };
  /** URL absoluta para ver o cancelar la reserva. */
  enlaceGestion: string;
};

const columnas = {
  id: reservas.id,
  codigo: reservas.codigo,
  fecha: reservas.fecha,
  horaInicio: reservas.horaInicio,
  cupos: reservas.cupos,
  idioma: reservas.idioma,
  nombre: reservas.nombre,
  email: reservas.email,
  telefono: reservas.telefono,
  notas: reservas.notas,
  precioUnitario: reservas.precioUnitario,
  estado: reservas.estado,
  canal: reservas.canal,
  experiencia: { nombre: experiencias.nombre, ubicacion: experiencias.ubicacion, duracionMin: experiencias.duracionMin },
};

function conEnlace<T extends { id: string; codigo: string }>(fila: T): T & { enlaceGestion: string } {
  const base = publicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  return { ...fila, enlaceGestion: `${base}/reserva/${fila.codigo}?t=${tokenDeGestion(fila.id)}` };
}

export async function reservaParaNotificar(id: string): Promise<ReservaParaNotificar | null> {
  const [fila] = await db()
    .select(columnas)
    .from(reservas)
    .innerJoin(experiencias, eq(experiencias.id, reservas.experienciaId))
    .where(eq(reservas.id, id));
  return fila ? conEnlace(fila) : null;
}

/** Reservas activas de `fecha`, con correo y sin recordatorio enviado. */
export async function reservasParaRecordar(fecha: Fecha): Promise<ReservaParaNotificar[]> {
  const filas = await db()
    .select(columnas)
    .from(reservas)
    .innerJoin(experiencias, eq(experiencias.id, reservas.experienciaId))
    .where(
      and(
        eq(reservas.fecha, fecha),
        inArray(reservas.estado, [...ESTADOS_ACTIVOS]),
        isNull(reservas.recordatorioEnviadoEn),
      ),
    );
  return filas.filter((f) => f.email).map(conEnlace);
}

export async function marcarRecordatorioEnviado(id: string): Promise<void> {
  await db().update(reservas).set({ recordatorioEnviadoEn: new Date() }).where(eq(reservas.id, id));
}

/** Fecha de mañana en la zona del negocio. */
export function fechaDeManana(): Fecha {
  return sumarDias(ahoraEnZona(serverEnv().BUSINESS_TIMEZONE).fecha, 1);
}
