/**
 * Tablas del motor de reservas de Coffee Tasting (gestionadas por drizzle-kit).
 *
 * - Prefijo `tasting_`: conviven con la tabla `reservations` del sitio
 *   anterior sin tocarla. Al pasar a v2 se migran sus datos.
 * - RLS habilitado SIN políticas: la API pública de Supabase (anon key)
 *   no puede leer ni escribir nada. Solo el servidor accede, vía
 *   DATABASE_URL, y valida permisos en las server actions.
 * - Horas como texto 'HH:MM' en la zona horaria del negocio (America/Bogota):
 *   son horas "de pared" del local, no instantes UTC.
 */
import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { CANALES, ESTADOS } from '../domain/tipos';

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
};

/** Experiencias que se pueden reservar (Coffee Tasting, Tasting Completo…). */
export const experiencias = pgTable(
  'tasting_experiencias',
  {
    id: text('id').primaryKey(), // slug legible: 'tasting', 'tasting-completo'
    nombre: text('nombre').notNull(),
    resumen: text('resumen').notNull(),
    descripcion: text('descripcion').notNull(),
    /** Ruta de imagen en /public (p. ej. '/Tasting1.webp'). */
    imagen: text('imagen'),
    tematica: text('tematica').notNull(),
    cafes: text('cafes').notNull(),
    idiomas: text('idiomas').array().notNull(),
    ubicacion: text('ubicacion').notNull(),
    precio: integer('precio').notNull(), // COP, por persona
    duracionMin: integer('duracion_min').notNull(),
    activa: boolean('activa').notNull().default(true),
    orden: smallint('orden').notNull().default(0),
    ...timestamps,
  },
  (t) => [check('precio_no_negativo', sql`${t.precio} >= 0`), check('duracion_positiva', sql`${t.duracionMin} > 0`)],
).enableRLS();

/** Franjas semanales de atención. La capacidad se comparte entre experiencias. */
export const horarios = pgTable(
  'tasting_horarios',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    diaSemana: smallint('dia_semana').notNull(), // 0 = domingo … 6 = sábado
    horaInicio: text('hora_inicio').notNull(), // 'HH:MM'
    capacidad: integer('capacidad').notNull(),
    activo: boolean('activo').notNull().default(true),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('tasting_horarios_dia_hora_uq').on(t.diaSemana, t.horaInicio),
    check('dia_semana_valido', sql`${t.diaSemana} BETWEEN 0 AND 6`),
    check('hora_valida', sql`${t.horaInicio} ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'`),
    check('capacidad_positiva', sql`${t.capacidad} > 0`),
  ],
).enableRLS();

/** Cierres puntuales: un día completo (horaInicio null) o una franja concreta. */
export const bloqueos = pgTable(
  'tasting_bloqueos',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fecha: date('fecha').notNull(),
    horaInicio: text('hora_inicio'),
    motivo: text('motivo').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tasting_bloqueos_fecha_idx').on(t.fecha)],
).enableRLS();


export const reservas = pgTable(
  'tasting_reservas',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Código corto que ve el cliente (p. ej. DEP-7K3QX). */
    codigo: text('codigo').notNull(),
    experienciaId: text('experiencia_id')
      .notNull()
      .references(() => experiencias.id, { onDelete: 'restrict' }),
    fecha: date('fecha').notNull(),
    horaInicio: text('hora_inicio').notNull(),
    cupos: integer('cupos').notNull(),
    idioma: text('idioma').notNull(),
    nombre: text('nombre').notNull(),
    /** Null solo en reservas registradas por el admin sin correo. */
    email: text('email'),
    telefono: text('telefono').notNull(),
    notas: text('notas'),
    /** Precio por persona al momento de reservar (no cambia si luego sube el precio). */
    precioUnitario: integer('precio_unitario').notNull(),
    estado: text('estado', { enum: ESTADOS }).notNull().default('pendiente'),
    canal: text('canal', { enum: CANALES }).notNull().default('web'),
    /** SHA-256 del token del enlace de gestión (el token en claro solo lo tiene el cliente). */
    tokenHash: text('token_hash').notNull(),
    /** Evita duplicados por doble clic o reintentos de red. */
    idempotencyKey: text('idempotency_key'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('tasting_reservas_codigo_uq').on(t.codigo),
    uniqueIndex('tasting_reservas_idem_uq').on(t.idempotencyKey),
    index('tasting_reservas_fecha_hora_idx').on(t.fecha, t.horaInicio),
    index('tasting_reservas_email_idx').on(t.email),
    check('cupos_positivos', sql`${t.cupos} > 0`),
    check('estado_valido', sql.raw(`estado IN (${ESTADOS.map((e) => `'${e}'`).join(', ')})`)),
    check('canal_valido', sql.raw(`canal IN (${CANALES.map((c) => `'${c}'`).join(', ')})`)),
  ],
).enableRLS();

/** Auditoría de cada cambio de estado (quién, cuándo, por qué). */
export const reservasHistorial = pgTable(
  'tasting_reservas_historial',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reservaId: uuid('reserva_id')
      .notNull()
      .references(() => reservas.id, { onDelete: 'cascade' }),
    estadoAnterior: text('estado_anterior'),
    estadoNuevo: text('estado_nuevo').notNull(),
    /** 'cliente', 'sistema' o el email del admin. */
    actor: text('actor').notNull(),
    nota: text('nota'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('tasting_historial_reserva_idx').on(t.reservaId)],
).enableRLS();

/** Reglas del negocio editables desde el admin (una sola fila, id = 1). */
export const ajustes = pgTable(
  'tasting_ajustes',
  {
    id: smallint('id').primaryKey().default(1),
    /** Minutos mínimos entre "ahora" y el inicio de la sesión para poder reservar. */
    anticipacionMinMinutos: integer('anticipacion_min_minutos').notNull().default(120),
    /** Hasta cuántos días hacia adelante se puede reservar. */
    diasMaxFuturo: integer('dias_max_futuro').notNull().default(60),
    /** Máximo de personas en una misma reserva. */
    cuposMaxPorReserva: integer('cupos_max_por_reserva').notNull().default(4),
    /** Horas mínimas antes de la sesión para que el cliente cancele en línea. */
    horasMinCancelacion: integer('horas_min_cancelacion').notNull().default(24),
    /** Si true, los festivos de Colombia se tratan como cerrados. */
    cerrarFestivos: boolean('cerrar_festivos').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [check('fila_unica', sql`${t.id} = 1`)],
).enableRLS();
