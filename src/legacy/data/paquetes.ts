/**
 * data/paquetes.ts
 * ─────────────────────────────────────────────────────────────────
 * Paquetes de Coffee Testing — fuente única de verdad.
 *
 * Antes, la lista de paquetes estaba duplicada en:
 *   - (antes) ReservaSidePanel, retirado: las reservas usan el motor v2 (/reservar)
 *   - components/views/ServiciosView.tsx (presentación de marketing: imagen, copy largo)
 *
 * Aquí viven los datos canónicos (tipo ReservationPackage de @/types) y la
 * presentación de marketing asociada por paquete. Cambiar un precio o duración
 * en este archivo se refleja en ambos consumidores sin desincronizaciones.
 * ─────────────────────────────────────────────────────────────────
 */

import type { ReservationPackage, ReservationPackageId } from '@/legacy/types';

/** Datos canónicos de cada paquete (precios en COP, duración en minutos). */
export const PAQUETES: ReservationPackage[] = [
  {
    id: 'testing_1',
    nombre: 'Coffee Tasting El Depósito',
    precio: 45000,
    duracion: 30,
    tematica: 'Generalidades del café, Características de la caficultura colombiana, Explicación de preparación cafés filtrados.',
    cafes: '3 cafés (Tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    idiomas: 'Español - Inglés - Portugués',
    ubicacion: 'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    descripcion: 'Experiencia esencial de café de especialidad.',
  },
  {
    id: 'testing_2',
    nombre: 'Coffee Tasting El Depósito Completo',
    precio: 120000,
    duracion: 60,
    tematica: 'Generalidades del café, Caficultura colombiana, Explicación preparaciones café filtrado, Origen del café, Panorama de mercado, Profundización en procesos de producción.',
    cafes: '5 cafés (tradicionales y fermentados con beneficios experimentales, incluyendo cafés premiados a nivel internacional).',
    idiomas: 'Español - Inglés - Portugués',
    ubicacion: 'El Depósito tienda de café (Calle Curato # 38 - 48 local 3, Barrio San Diego)',
    descripcion: 'Experiencia completa y profunda de café de especialidad.',
  },
];

/** Presentación de marketing por paquete (usada por la vista de Servicios). */
export interface PaqueteMarketing {
  imagen: string;
  /** Texto corto de cafés para la tarjeta de marketing */
  cafesCorto: string;
  /** Copy largo de marketing para la tarjeta */
  descripcionLarga: string;
}

export const PAQUETES_MARKETING: Record<ReservationPackageId, PaqueteMarketing> = {
  testing_1: {
    imagen: '/Tasting1.webp',
    cafesCorto: '3 cafés de especialidad',
    descripcionLarga:
      'Una experiencia esencial para quienes quieren descubrir el café de especialidad. Aprende sobre generalidades del café, las características de la caficultura colombiana y la preparación de cafés filtrados mientras degustas tres cafés excepcionales.',
  },
  testing_2: {
    imagen: '/Tasting2.webp',
    cafesCorto: '5 cafés de especialidad',
    descripcionLarga:
      'La experiencia más profunda. Perfecta para quienes ya conocen el café especial y quieren ir más allá: origen, procesos de producción, panorama de mercado y una cata de cinco cafés que incluye fermentados con beneficios experimentales y premiados internacionalmente.',
  },
};
