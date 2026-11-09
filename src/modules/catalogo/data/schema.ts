/**
 * Tablas propiedad del módulo `catalogo`.
 * Refleja el esquema ACTUAL en Supabase (migraciones en /supabase).
 */
import { pgTable, uuid, text, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';

export const cafes = pgTable('cafes', {
  id: uuid('id').primaryKey().defaultRandom(),
  nombre: text('nombre').notNull(),
  departamentoId: text('departamento_id').notNull(),
  finca: text('finca'),
  altura: text('altura'),
  proceso: text('proceso'),
  notas: text('notas'),
  categoria: text('categoria'),
  visible: boolean('visible').default(true),
  preparacion: text('preparacion'),
  sugerencias: text('sugerencias'),
  descripcionLarga: text('descripcion_larga'),
  metodoSugerido: text('metodo_sugerido'),
  tipoProducto: text('tipo_producto').notNull().default('cafe'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const userFavorites = pgTable(
  'user_favorites',
  {
    userId: uuid('user_id').notNull(),
    coffeeId: uuid('coffee_id').notNull().references(() => cafes.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.coffeeId] })],
);
