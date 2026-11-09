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
