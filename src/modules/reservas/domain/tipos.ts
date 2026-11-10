/**
 * Tipos del dominio de reservas (independientes de la base de datos).
 */
import type { Fecha, Hora } from './tiempo';

export const ESTADOS = ['pendiente', 'confirmada', 'completada', 'cancelada', 'no_show'] as const;
export type EstadoReserva = (typeof ESTADOS)[number];

export const CANALES = ['web', 'whatsapp', 'telefono', 'presencial', 'bot'] as const;
export type Canal = (typeof CANALES)[number];

/** Estados que ocupan cupo. */
export const ESTADOS_ACTIVOS: readonly EstadoReserva[] = ['pendiente', 'confirmada'];

export type Ajustes = {
  anticipacionMinMinutos: number;
  diasMaxFuturo: number;
  cuposMaxPorReserva: number;
  horasMinCancelacion: number;
  cerrarFestivos: boolean;
};

export type Horario = {
  diaSemana: number;
  horaInicio: Hora;
  capacidad: number;
};

export type Bloqueo = {
  fecha: Fecha;
  /** null = día completo. */
  horaInicio: Hora | null;
  motivo: string;
};

/** Cupos ocupados por "fecha hora" (clave: `${fecha} ${hora}`). */
export type Ocupacion = ReadonlyMap<string, number>;

export const claveFranja = (fecha: Fecha, hora: Hora) => `${fecha} ${hora}`;

export type EstadoFranja = 'disponible' | 'agotada' | 'pasada' | 'bloqueada';

export type Franja = {
  hora: Hora;
  capacidad: number;
  ocupados: number;
  disponibles: number;
  estado: EstadoFranja;
  motivo?: string;
};

export type EstadoDia = 'disponible' | 'agotado' | 'cerrado' | 'fuera_de_rango';

export type DiaCalendario = {
  fecha: Fecha;
  estado: EstadoDia;
  /** Suma de cupos libres en franjas reservables. */
  cuposLibres: number;
  festivo: boolean;
};

/** Experiencia tal como la ve el cliente. */
export type Experiencia = {
  id: string;
  nombre: string;
  resumen: string;
  descripcion: string;
  imagen: string | null;
  tematica: string;
  cafes: string;
  idiomas: string[];
  ubicacion: string;
  /** COP por persona. */
  precio: number;
  duracionMin: number;
};

/** Reserva tal como la ve el cliente en su enlace de gestión. */
export type ReservaPublica = {
  codigo: string;
  experiencia: Pick<Experiencia, 'id' | 'nombre' | 'ubicacion' | 'duracionMin'>;
  fecha: Fecha;
  horaInicio: Hora;
  cupos: number;
  idioma: string;
  nombre: string;
  email: string | null;
  telefono: string;
  notas: string | null;
  precioUnitario: number;
  estado: EstadoReserva;
};

// ─── Panel administrativo ─────────────────────────────────────────

/** Reserva tal como la ve el admin en la agenda. */
export type ReservaAgenda = {
  id: string;
  codigo: string;
  experienciaId: string;
  experienciaNombre: string;
  fecha: Fecha;
  horaInicio: Hora;
  cupos: number;
  idioma: string;
  nombre: string;
  email: string | null;
  telefono: string;
  notas: string | null;
  precioUnitario: number;
  estado: EstadoReserva;
  canal: Canal;
  creadaEn: string; // ISO
};

export type CambioHistorial = {
  estadoAnterior: string | null;
  estadoNuevo: string;
  actor: string;
  nota: string | null;
  fecha: string; // ISO
};

export type HorarioAdmin = Horario & { id: string; activo: boolean };
export type BloqueoAdmin = Bloqueo & { id: string };
export type ExperienciaAdmin = Experiencia & { activa: boolean; orden: number };
