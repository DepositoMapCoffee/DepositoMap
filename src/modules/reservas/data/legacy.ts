/**
 * Tablas propiedad del módulo `reservas`.
 * Tablas EXISTENTES (creadas con las migraciones SQL de /supabase).
 * NO las gestiona drizzle-kit (este archivo no está en drizzle.config.ts);
 * se declaran solo para poder consultarlas con tipos.
 * Refleja el esquema ACTUAL en Supabase (migraciones en /supabase).
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
