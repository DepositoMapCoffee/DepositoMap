/**
 * Acceso a datos del panel administrativo de reservas.
 * Solo se llama desde actions/admin.ts y consultas de páginas del panel,
 * que verifican requireAdmin() antes.
 */
import 'server-only';
import { and, asc, between, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/shared/infra/db';
import type { Fecha } from '../domain/tiempo';
import type {
  Ajustes,
  BloqueoAdmin,
  CambioHistorial,
  EstadoReserva,
  ExperienciaAdmin,
  HorarioAdmin,
  ReservaAgenda,
} from '../domain/tipos';
import { ajustes, bloqueos, experiencias, horarios, reservas, reservasHistorial } from './schema';

// ─── Agenda ────────────────────────────────────────────────────────

export async function agendaEntre(desde: Fecha, hasta: Fecha): Promise<ReservaAgenda[]> {
  const filas = await db()
    .select({
      id: reservas.id,
      codigo: reservas.codigo,
      experienciaId: reservas.experienciaId,
      experienciaNombre: experiencias.nombre,
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
      creadaEn: reservas.createdAt,
    })
    .from(reservas)
    .innerJoin(experiencias, eq(experiencias.id, reservas.experienciaId))
    .where(between(reservas.fecha, desde, hasta))
    .orderBy(asc(reservas.fecha), asc(reservas.horaInicio), asc(reservas.createdAt));
  return filas.map((f) => ({ ...f, creadaEn: f.creadaEn.toISOString() }));
}

/** Reservas pendientes de confirmar desde una fecha (para el aviso del panel). */
export async function contarPendientesDesde(desde: Fecha): Promise<number> {
  const filas = await db()
    .select({ id: reservas.id })
    .from(reservas)
    .where(and(eq(reservas.estado, 'pendiente'), gte(reservas.fecha, desde)));
  return filas.length;
}

export async function estadoDeReserva(id: string): Promise<EstadoReserva | null> {
  const [fila] = await db().select({ estado: reservas.estado }).from(reservas).where(eq(reservas.id, id));
  return fila?.estado ?? null;
}

export async function historialDe(reservaId: string): Promise<CambioHistorial[]> {
  const filas = await db()
    .select({
      estadoAnterior: reservasHistorial.estadoAnterior,
      estadoNuevo: reservasHistorial.estadoNuevo,
      actor: reservasHistorial.actor,
      nota: reservasHistorial.nota,
      fecha: reservasHistorial.createdAt,
    })
    .from(reservasHistorial)
    .where(eq(reservasHistorial.reservaId, reservaId))
    .orderBy(desc(reservasHistorial.createdAt));
  return filas.map((f) => ({ ...f, fecha: f.fecha.toISOString() }));
}

// ─── Horarios ──────────────────────────────────────────────────────

export async function listarHorarios(): Promise<HorarioAdmin[]> {
  return db()
    .select({
      id: horarios.id,
      diaSemana: horarios.diaSemana,
      horaInicio: horarios.horaInicio,
      capacidad: horarios.capacidad,
      activo: horarios.activo,
    })
    .from(horarios)
    .orderBy(asc(horarios.diaSemana), asc(horarios.horaInicio));
}

/** Crea la misma franja en varios días. Devuelve cuántas eran nuevas. */
export async function crearHorarios(dias: number[], hora: string, capacidad: number): Promise<number> {
  const creadas = await db()
    .insert(horarios)
    .values(dias.map((d) => ({ diaSemana: d, horaInicio: hora, capacidad })))
    .onConflictDoNothing()
    .returning({ id: horarios.id });
  return creadas.length;
}

export async function actualizarHorario(id: string, cambios: { capacidad?: number; activo?: boolean }): Promise<void> {
  await db()
    .update(horarios)
    .set({ ...cambios, updatedAt: new Date() })
    .where(eq(horarios.id, id));
}

export async function eliminarHorario(id: string): Promise<void> {
  await db().delete(horarios).where(eq(horarios.id, id));
}

// ─── Bloqueos ──────────────────────────────────────────────────────

export async function listarBloqueosDesde(desde: Fecha): Promise<BloqueoAdmin[]> {
  return db()
    .select({ id: bloqueos.id, fecha: bloqueos.fecha, horaInicio: bloqueos.horaInicio, motivo: bloqueos.motivo })
    .from(bloqueos)
    .where(gte(bloqueos.fecha, desde))
    .orderBy(asc(bloqueos.fecha), asc(bloqueos.horaInicio));
}

export async function crearBloqueo(fecha: Fecha, horaInicio: string | null, motivo: string): Promise<void> {
  await db().insert(bloqueos).values({ fecha, horaInicio, motivo });
}

export async function eliminarBloqueo(id: string): Promise<void> {
  await db().delete(bloqueos).where(eq(bloqueos.id, id));
}

// ─── Ajustes ───────────────────────────────────────────────────────

export async function guardarAjustes(valores: Ajustes): Promise<void> {
  await db()
    .insert(ajustes)
    .values({ id: 1, ...valores })
    .onConflictDoUpdate({ target: ajustes.id, set: { ...valores, updatedAt: new Date() } });
}

// ─── Experiencias ──────────────────────────────────────────────────

export async function listarExperienciasAdmin(): Promise<ExperienciaAdmin[]> {
  return db()
    .select({
      id: experiencias.id,
      nombre: experiencias.nombre,
      resumen: experiencias.resumen,
      descripcion: experiencias.descripcion,
      imagen: experiencias.imagen,
      tematica: experiencias.tematica,
      cafes: experiencias.cafes,
      idiomas: experiencias.idiomas,
      ubicacion: experiencias.ubicacion,
      precio: experiencias.precio,
      duracionMin: experiencias.duracionMin,
      activa: experiencias.activa,
      orden: experiencias.orden,
    })
    .from(experiencias)
    .orderBy(asc(experiencias.orden), asc(experiencias.nombre));
}

export type CambiosExperiencia = Pick<
  ExperienciaAdmin,
  'nombre' | 'resumen' | 'descripcion' | 'tematica' | 'cafes' | 'idiomas' | 'precio' | 'duracionMin' | 'activa'
>;

export async function actualizarExperiencia(id: string, cambios: CambiosExperiencia): Promise<void> {
  await db()
    .update(experiencias)
    .set({ ...cambios, updatedAt: new Date() })
    .where(eq(experiencias.id, id));
}
