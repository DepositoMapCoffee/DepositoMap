/**
 * Acceso a datos del motor de reservas (única capa que toca la BD).
 */
import 'server-only';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { and, asc, between, eq, inArray, sql } from 'drizzle-orm';
import { db } from '@/shared/infra/db';
import { serverEnv } from '@/shared/config/env';
import { verificarFranja, type ContextoDisponibilidad } from '../domain/disponibilidad';
import { generarCodigo } from '../domain/reglas';
import type { Ahora, Fecha } from '../domain/tiempo';
import {
  claveFranja,
  ESTADOS_ACTIVOS,
  type Ajustes,
  type Bloqueo,
  type Canal,
  type EstadoReserva,
  type Experiencia,
  type Horario,
  type ReservaPublica,
} from '../domain/tipos';
import { ajustes, bloqueos, experiencias, horarios, reservas, reservasHistorial } from './schema';

type Tx = Parameters<Parameters<ReturnType<typeof db>['transaction']>[0]>[0];
type Conn = ReturnType<typeof db> | Tx;

const AJUSTES_POR_DEFECTO: Ajustes = {
  anticipacionMinMinutos: 120,
  diasMaxFuturo: 60,
  cuposMaxPorReserva: 4,
  horasMinCancelacion: 24,
  cerrarFestivos: false,
};

// ─── Lecturas ──────────────────────────────────────────────────────

export async function obtenerAjustes(conn: Conn = db()): Promise<Ajustes> {
  const [fila] = await conn.select().from(ajustes).where(eq(ajustes.id, 1));
  if (!fila) return AJUSTES_POR_DEFECTO;
  return {
    anticipacionMinMinutos: fila.anticipacionMinMinutos,
    diasMaxFuturo: fila.diasMaxFuturo,
    cuposMaxPorReserva: fila.cuposMaxPorReserva,
    horasMinCancelacion: fila.horasMinCancelacion,
    cerrarFestivos: fila.cerrarFestivos,
  };
}

const columnasExperiencia = {
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
};

export async function listarExperienciasActivas(): Promise<Experiencia[]> {
  return db()
    .select(columnasExperiencia)
    .from(experiencias)
    .where(eq(experiencias.activa, true))
    .orderBy(asc(experiencias.orden), asc(experiencias.nombre));
}

async function obtenerExperienciaActiva(id: string, conn: Conn): Promise<Experiencia | null> {
  const [fila] = await conn
    .select(columnasExperiencia)
    .from(experiencias)
    .where(and(eq(experiencias.id, id), eq(experiencias.activa, true)));
  return fila ?? null;
}

async function horariosActivos(conn: Conn): Promise<Horario[]> {
  return conn
    .select({ diaSemana: horarios.diaSemana, horaInicio: horarios.horaInicio, capacidad: horarios.capacidad })
    .from(horarios)
    .where(eq(horarios.activo, true));
}

async function bloqueosEntre(desde: Fecha, hasta: Fecha, conn: Conn): Promise<Bloqueo[]> {
  return conn
    .select({ fecha: bloqueos.fecha, horaInicio: bloqueos.horaInicio, motivo: bloqueos.motivo })
    .from(bloqueos)
    .where(between(bloqueos.fecha, desde, hasta));
}

async function ocupacionEntre(desde: Fecha, hasta: Fecha, conn: Conn): Promise<Map<string, number>> {
  const filas = await conn
    .select({
      fecha: reservas.fecha,
      hora: reservas.horaInicio,
      cupos: sql<number>`COALESCE(SUM(${reservas.cupos}), 0)::int`,
    })
    .from(reservas)
    .where(and(between(reservas.fecha, desde, hasta), inArray(reservas.estado, [...ESTADOS_ACTIVOS])))
    .groupBy(reservas.fecha, reservas.horaInicio);
  return new Map(filas.map((f) => [claveFranja(f.fecha, f.hora), f.cupos]));
}

/** Reúne todo lo necesario para calcular disponibilidad en un rango de fechas. */
export async function contextoDisponibilidad(
  desde: Fecha,
  hasta: Fecha,
  ahora: Ahora,
  conn: Conn = db(),
): Promise<ContextoDisponibilidad> {
  const [ajustesActuales, horariosActuales, bloqueosRango, ocupacion] = await Promise.all([
    obtenerAjustes(conn),
    horariosActivos(conn),
    bloqueosEntre(desde, hasta, conn),
    ocupacionEntre(desde, hasta, conn),
  ]);
  return { ahora, ajustes: ajustesActuales, horarios: horariosActuales, bloqueos: bloqueosRango, ocupacion };
}

// ─── Tokens del enlace de gestión ──────────────────────────────────

/**
 * Token del enlace de gestión: firma HMAC del id de la reserva con
 * RESERVAS_SECRETO. Se puede regenerar para cada correo (confirmación,
 * recordatorio) sin guardarlo en claro; en la BD solo queda su SHA-256.
 */
export function tokenDeGestion(reservaId: string): string {
  return createHmac('sha256', serverEnv().RESERVAS_SECRETO).update(`gestion:${reservaId}`).digest('base64url').slice(0, 32);
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function tokenCoincide(token: string, hashGuardado: string): boolean {
  const a = Buffer.from(hashToken(token), 'hex');
  const b = Buffer.from(hashGuardado, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

// ─── Crear reserva (atómica) ───────────────────────────────────────

export type NuevaReserva = {
  experienciaId: string;
  fecha: Fecha;
  hora: string;
  cupos: number;
  idioma: string;
  nombre: string;
  /** Opcional solo en reservas registradas por el admin (teléfono, presencial…). */
  email: string | null;
  telefono: string;
  notas?: string;
  canal: Canal;
  idempotencyKey?: string;
  /** 'cliente' o el email del admin que la registra. */
  actor: string;
  /**
   * Reserva registrada por el admin: puede saltarse la anticipación mínima
   * (hasta 3 h hacia atrás, para registrar a quien llegó sin reserva), el
   * límite de días futuros y el máximo de personas por reserva.
   * La CAPACIDAD de la franja se respeta siempre.
   */
  porAdmin?: boolean;
  estadoInicial?: 'pendiente' | 'confirmada';
  /** Versión de la política de datos que el cliente autorizó (prueba de autorización). */
  autorizacionDatosVersion: string;
};

export type ResultadoCrear =
  | { ok: true; id: string; codigo: string; token: string | null; duplicada: boolean }
  | { ok: false; motivo: string };

export async function crearReserva(datos: NuevaReserva, ahora: Ahora): Promise<ResultadoCrear> {
  return db().transaction(async (tx) => {
    // 1. Serializa las reservas de la MISMA franja: dos personas no pueden
    //    tomar el último cupo a la vez. Se libera al terminar la transacción.
    //    Va primero para que también dos envíos idénticos simultáneos esperen
    //    y el segundo vea la reserva del primero (paso 2).
    await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${`tasting:${datos.fecha}:${datos.hora}`}))`);

    // 2. Reintento del mismo envío → devolver la reserva ya creada.
    if (datos.idempotencyKey) {
      const [previa] = await tx
        .select({ id: reservas.id, codigo: reservas.codigo })
        .from(reservas)
        .where(eq(reservas.idempotencyKey, datos.idempotencyKey));
      if (previa) return { ok: true, id: previa.id, codigo: previa.codigo, token: tokenDeGestion(previa.id), duplicada: true };
    }

    const experiencia = await obtenerExperienciaActiva(datos.experienciaId, tx);
    if (!experiencia) return { ok: false, motivo: 'Esta experiencia no está disponible.' };
    if (!experiencia.idiomas.includes(datos.idioma)) {
      return { ok: false, motivo: 'Idioma no disponible para esta experiencia.' };
    }

    // 3. Recalcula la disponibilidad DENTRO del bloqueo.
    const ctxBase = await contextoDisponibilidad(datos.fecha, datos.fecha, ahora, tx);
    const ctx = datos.porAdmin
      ? {
          ...ctxBase,
          ajustes: { ...ctxBase.ajustes, anticipacionMinMinutos: -180, diasMaxFuturo: 3650, cuposMaxPorReserva: 999 },
        }
      : ctxBase;
    const verificacion = verificarFranja(datos.fecha, datos.hora, datos.cupos, ctx);
    if (!verificacion.ok) return { ok: false, motivo: verificacion.motivo };

    // 4. Inserta con un código único (reintenta ante la improbable colisión).
    const id = randomUUID();
    const token = tokenDeGestion(id);
    for (let intento = 0; intento < 5; intento++) {
      const codigo = generarCodigo();
      const [creada] = await tx
        .insert(reservas)
        .values({
          id,
          codigo,
          experienciaId: experiencia.id,
          fecha: datos.fecha,
          horaInicio: datos.hora,
          cupos: datos.cupos,
          idioma: datos.idioma,
          nombre: datos.nombre,
          email: datos.email,
          telefono: datos.telefono,
          notas: datos.notas ?? null,
          precioUnitario: experiencia.precio,
          estado: datos.estadoInicial ?? 'pendiente',
          canal: datos.canal,
          tokenHash: hashToken(token),
          idempotencyKey: datos.idempotencyKey ?? null,
          autorizacionDatosVersion: datos.autorizacionDatosVersion,
          autorizacionDatosEn: new Date(),
        })
        .onConflictDoNothing({ target: reservas.codigo })
        .returning({ id: reservas.id, codigo: reservas.codigo });

      if (creada) {
        await tx.insert(reservasHistorial).values({
          reservaId: creada.id,
          estadoAnterior: null,
          estadoNuevo: datos.estadoInicial ?? 'pendiente',
          actor: datos.actor,
          nota: `Creada por canal ${datos.canal}`,
        });
        return { ok: true, id: creada.id, codigo: creada.codigo, token, duplicada: false };
      }
    }
    throw new Error('[reservas] No se pudo generar un código único');
  });
}

// ─── Gestión por el cliente (enlace con token) ─────────────────────

async function filaPorCodigo(codigo: string, conn: Conn) {
  const [fila] = await conn
    .select({
      id: reservas.id,
      codigo: reservas.codigo,
      tokenHash: reservas.tokenHash,
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
      experiencia: {
        id: experiencias.id,
        nombre: experiencias.nombre,
        ubicacion: experiencias.ubicacion,
        duracionMin: experiencias.duracionMin,
      },
    })
    .from(reservas)
    .innerJoin(experiencias, eq(experiencias.id, reservas.experienciaId))
    .where(eq(reservas.codigo, codigo.toUpperCase()));
  return fila ?? null;
}

/** Devuelve la reserva SOLO si el token del enlace es correcto. */
export async function reservaConToken(codigo: string, token: string): Promise<(ReservaPublica & { id: string }) | null> {
  const fila = await filaPorCodigo(codigo, db());
  if (!fila || !tokenCoincide(token, fila.tokenHash)) return null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { tokenHash, ...publica } = fila;
  return publica;
}

/** Cambia el estado dejando rastro en el historial. */
export async function cambiarEstado(
  reservaId: string,
  de: EstadoReserva,
  a: EstadoReserva,
  actor: string,
  nota?: string,
): Promise<boolean> {
  return db().transaction(async (tx) => {
    const actualizadas = await tx
      .update(reservas)
      .set({ estado: a, updatedAt: new Date() })
      .where(and(eq(reservas.id, reservaId), eq(reservas.estado, de))) // evita carreras: solo si sigue en `de`
      .returning({ id: reservas.id });
    if (actualizadas.length === 0) return false;
    await tx.insert(reservasHistorial).values({ reservaId, estadoAnterior: de, estadoNuevo: a, actor, nota: nota ?? null });
    return true;
  });
}
