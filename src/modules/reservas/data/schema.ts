/**
 * Tablas propiedad del módulo `reservas`.
 * Refleja el esquema ACTUAL en Supabase (migraciones en /supabase).
 * En la fase 2 se amplía con experiencias, horarios y bloqueos.
 */
import { pgTable, uuid, text, date, integer, timestamp } from 'drizzle-orm/pg-core';

export const reservations = pgTable('reservations', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull(),
  telefono: text('telefono').notNull(),
  fecha: date('fecha').notNull(),
  horario: text('horario').notNull(),
  paquete: text('paquete').notNull(),
  cupos: integer('cupos').notNull().default(1),
  estado: text('estado').notNull().default('pendiente'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
