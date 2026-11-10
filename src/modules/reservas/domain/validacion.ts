/**
 * Validación de la solicitud de reserva (compartida por servidor y cliente).
 */
import { z } from 'zod';
import { esFechaValida, esHoraValida } from './tiempo';

const telefono = z
  .string()
  .trim()
  .refine((v) => /^\+?[\d\s()-]+$/.test(v), 'Usa solo números, espacios y +')
  .refine((v) => {
    const digitos = v.replace(/\D/g, '').length;
    return digitos >= 7 && digitos <= 15;
  }, 'Escribe un teléfono válido (7 a 15 dígitos)');

export const solicitudReservaSchema = z.object({
  experienciaId: z.string().min(1, 'Elige una experiencia'),
  fecha: z.string().refine(esFechaValida, 'Elige una fecha'),
  hora: z.string().refine(esHoraValida, 'Elige un horario'),
  cupos: z.coerce.number().int().min(1, 'Mínimo 1 persona'),
  idioma: z.string().min(1, 'Elige un idioma'),
  nombre: z.string().trim().min(2, 'Escribe tu nombre').max(80, 'Máximo 80 caracteres'),
  email: z.email('Escribe un correo válido').trim().toLowerCase().max(120),
  telefono,
  notas: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .optional()
    .transform((v) => v || undefined),
  /** Autorización de tratamiento de datos (Ley 1581 de 2012). */
  aceptaDatos: z.literal(true, { error: 'Necesitamos tu autorización para gestionar la reserva' }),
  /** Clave única por intento: evita reservas duplicadas por doble envío. */
  idempotencyKey: z.uuid(),
  /** Trampa anti-bots: campo oculto que una persona nunca llena. */
  sitioWeb: z.string().max(0).optional(),
});

export type SolicitudReserva = z.infer<typeof solicitudReservaSchema>;

/** Errores por campo, listos para mostrar en el formulario. */
export type ErroresCampos = Partial<Record<keyof SolicitudReserva | 'general', string>>;

export function erroresDeZod(error: z.ZodError): ErroresCampos {
  const errores: ErroresCampos = {};
  for (const issue of error.issues) {
    const campo = (issue.path[0] as keyof SolicitudReserva) ?? 'general';
    errores[campo] ??= issue.message;
  }
  return errores;
}

// ─── Panel administrativo ─────────────────────────────────────────

const HORA = z.string().refine(esHoraValida, 'Hora inválida (HH:MM)');
const FECHA = z.string().refine(esFechaValida, 'Fecha inválida');

/** Reserva registrada por el admin (WhatsApp, teléfono, presencial). */
export const reservaManualSchema = z.object({
  experienciaId: z.string().min(1, 'Elige una experiencia'),
  fecha: FECHA,
  hora: HORA,
  cupos: z.coerce.number().int().min(1, 'Mínimo 1 persona').max(50),
  idioma: z.string().min(1, 'Elige un idioma'),
  nombre: z.string().trim().min(2, 'Escribe el nombre').max(80),
  telefono,
  email: z
    .string()
    .trim()
    .toLowerCase()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || z.email().safeParse(v).success, 'Correo inválido'),
  notas: z.string().trim().max(500).optional().transform((v) => v || undefined),
  canal: z.enum(['whatsapp', 'telefono', 'presencial']),
  confirmada: z.boolean(),
  /** El cliente autorizó el tratamiento de datos por el canal de contacto (Ley 1581). */
  autorizaDatos: z.literal(true, { error: 'Confirma que el cliente autorizó el tratamiento de sus datos' }),
});

export const horarioNuevoSchema = z.object({
  dias: z.array(z.coerce.number().int().min(0).max(6)).min(1, 'Elige al menos un día'),
  hora: HORA,
  capacidad: z.coerce.number().int().min(1, 'Mínimo 1 cupo').max(100),
});

export const bloqueoSchema = z.object({
  fecha: FECHA,
  hora: z
    .string()
    .optional()
    .transform((v) => v || null)
    .refine((v) => v === null || esHoraValida(v), 'Hora inválida'),
  motivo: z.string().trim().min(2, 'Escribe un motivo').max(120),
});

export const ajustesSchema = z.object({
  anticipacionMinMinutos: z.coerce.number().int().min(0).max(10080),
  diasMaxFuturo: z.coerce.number().int().min(1).max(365),
  cuposMaxPorReserva: z.coerce.number().int().min(1).max(50),
  horasMinCancelacion: z.coerce.number().int().min(0).max(720),
  cerrarFestivos: z.boolean(),
});

export const experienciaSchema = z.object({
  id: z.string().min(1),
  nombre: z.string().trim().min(2).max(120),
  resumen: z.string().trim().min(2).max(200),
  descripcion: z.string().trim().min(2).max(2000),
  tematica: z.string().trim().max(1000),
  cafes: z.string().trim().max(500),
  idiomas: z
    .string()
    .transform((v) => v.split(',').map((s) => s.trim()).filter(Boolean))
    .refine((v) => v.length > 0, 'Al menos un idioma'),
  precio: z.coerce.number().int().min(0, 'Precio inválido'),
  duracionMin: z.coerce.number().int().min(5).max(600),
  activa: z.boolean(),
});

/** Primer mensaje de error de un ZodError. */
export function primerError(error: z.ZodError): string {
  return error.issues[0]?.message ?? 'Datos inválidos';
}
