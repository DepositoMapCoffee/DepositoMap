/**
 * Datos del negocio (fuente única).
 * Cambiar aquí actualiza el sitio completo: pie de página, correos,
 * política de datos, enlaces de WhatsApp…
 */
export const NEGOCIO = {
  nombre: 'El Depósito',
  ciudad: 'Cartagena',
  direccion: 'Calle Curato # 38 - 48 local 3, Barrio San Diego',
  /** Número en formato internacional sin '+' (para wa.me). */
  whatsapp: '573232915975',
} as const;

/** Responsable del tratamiento de datos personales (Ley 1581 de 2012). */
export const RESPONSABLE_DATOS = {
  razonSocial: 'Distribuidora De Cafe El Depósito SAS',
  nit: '901745828-7',
  /** Canal oficial para consultas y reclamos sobre datos personales. */
  correo: 'depositocoffee@gmail.com',
} as const;

/**
 * Política de tratamiento de datos vigente.
 * Al cambiar el texto de la política, actualizar `version` (fecha): cada
 * reserva guarda la versión que el cliente autorizó (prueba de autorización).
 */
export const POLITICA_DATOS = {
  version: '2026-11-10',
  ruta: '/privacidad',
} as const;

export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
