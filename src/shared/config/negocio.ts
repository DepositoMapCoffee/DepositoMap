/**
 * Datos de contacto del negocio (fuente única).
 * Cambiar aquí actualiza el sitio completo.
 */
export const NEGOCIO = {
  nombre: 'El Depósito',
  ciudad: 'Cartagena',
  direccion: 'Calle Curato # 38 - 48 local 3, Barrio San Diego',
  /** Número en formato internacional sin '+' (para wa.me). */
  whatsapp: '573232915975',
} as const;

export function enlaceWhatsApp(mensaje?: string): string {
  const base = `https://wa.me/${NEGOCIO.whatsapp}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}
