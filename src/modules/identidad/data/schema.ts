/**
 * Tablas propiedad del módulo `identidad`.
 * Los usuarios viven en auth.users (gestionado por Supabase Auth).
 */
import { pgTable, text } from 'drizzle-orm/pg-core';

export const admins = pgTable('admins', {
  email: text('email').primaryKey(),
});
