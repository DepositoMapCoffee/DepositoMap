'use server';

/**
 * Server actions del panel administrativo de reservas.
 * TODAS empiezan verificando requireAdmin(): son endpoints POST que
 * cualquiera podría invocar, ocultar el botón no basta.
 */
import { revalidatePath } from 'next/cache';
import { publish } from '@/shared/events';
import { POLITICA_DATOS } from '@/shared/config/negocio';
import { serverEnv } from '@/shared/config/env';
import { requireAdmin, UnauthorizedError } from '@/modules/identidad';
import { franjasDelDia } from '../domain/disponibilidad';
import { puedeTransicionar, ETIQUETAS_ESTADO } from '../domain/reglas';
import { ahoraEnZona, esFechaValida } from '../domain/tiempo';
import { ESTADOS, type CambioHistorial, type EstadoReserva, type Franja } from '../domain/tipos';
import {
  ajustesSchema,
  bloqueoSchema,
  experienciaSchema,
  horarioNuevoSchema,
  primerError,
  reservaManualSchema,
} from '../domain/validacion';
import {
  actualizarExperiencia,
  actualizarHorario,
  crearBloqueo,
  crearHorarios,
  eliminarBloqueo,
  eliminarHorario,
  estadoDeReserva,
  guardarAjustes,
  historialDe,
} from '../data/admin';
import { cambiarEstado, contextoDisponibilidad, crearReserva } from '../data/repositorio';
import '../events';

export type ResultadoAdmin = { ok: true; mensaje?: string } | { ok: false; error: string };
export type EstadoFormAdmin = ResultadoAdmin | { ok: null };

const RUTAS = ['/panel/reservas', '/panel/configuracion'];
const refrescar = () => RUTAS.forEach((r) => revalidatePath(r));
const ahora = () => ahoraEnZona(serverEnv().BUSINESS_TIMEZONE);

/** Ejecuta `fn` solo si hay un admin; traduce errores a un resultado mostrable. */
async function comoAdmin<T extends ResultadoAdmin>(fn: (email: string) => Promise<T>): Promise<T | ResultadoAdmin> {
  try {
    const admin = await requireAdmin();
    return await fn(admin.email);
  } catch (error) {
    if (error instanceof UnauthorizedError) return { ok: false, error: 'Tu sesión expiró. Vuelve a ingresar.' };
    console.error('[reservas/admin]', error);
    return { ok: false, error: 'Ocurrió un error inesperado. Inténtalo de nuevo.' };
  }
}

// ─── Reservas ──────────────────────────────────────────────────────

export async function cambiarEstadoReserva(id: string, nuevo: EstadoReserva, nota?: string): Promise<ResultadoAdmin> {
  return comoAdmin(async (email) => {
    if (typeof id !== 'string' || !ESTADOS.includes(nuevo)) return { ok: false, error: 'Datos inválidos' };
    const actual = await estadoDeReserva(id);
    if (!actual) return { ok: false, error: 'La reserva no existe.' };
    if (!puedeTransicionar(actual, nuevo)) {
      return { ok: false, error: `No se puede pasar de "${ETIQUETAS_ESTADO[actual]}" a "${ETIQUETAS_ESTADO[nuevo]}".` };
    }
    const hecho = await cambiarEstado(id, actual, nuevo, email, nota?.slice(0, 300));
    if (!hecho) return { ok: false, error: 'La reserva cambió mientras tanto. Recarga la página.' };

    if (nuevo === 'confirmada') await publish('reserva.confirmada', { reservaId: id });
    if (nuevo === 'cancelada') await publish('reserva.cancelada', { reservaId: id, motivo: 'admin' });
    refrescar();
    return { ok: true, mensaje: `Reserva marcada como ${ETIQUETAS_ESTADO[nuevo].toLowerCase()}.` };
  });
}

export async function verHistorial(id: string): Promise<CambioHistorial[]> {
  await requireAdmin();
  return typeof id === 'string' ? historialDe(id) : [];
}

/** Franjas de un día con las reglas del admin (sin anticipación ni límite de días). */
export async function franjasParaAdmin(fecha: string): Promise<Franja[]> {
  await requireAdmin();
  if (!esFechaValida(fecha)) return [];
  const ctx = await contextoDisponibilidad(fecha, fecha, ahora());
  return franjasDelDia(fecha, {
    ...ctx,
    ajustes: { ...ctx.ajustes, anticipacionMinMinutos: -180, diasMaxFuturo: 3650 },
  });
}

export async function crearReservaManual(_previo: EstadoFormAdmin, formData: FormData): Promise<EstadoFormAdmin> {
  return comoAdmin(async (email) => {
    const parsed = reservaManualSchema.safeParse({
      ...Object.fromEntries(formData),
      confirmada: formData.get('confirmada') === 'on',
      autorizaDatos: formData.get('autorizaDatos') === 'on',
    });
    if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
    const d = parsed.data;

    const r = await crearReserva(
      {
        experienciaId: d.experienciaId,
        fecha: d.fecha,
        hora: d.hora,
        cupos: d.cupos,
        idioma: d.idioma,
        nombre: d.nombre,
        email: d.email,
        telefono: d.telefono,
        notas: d.notas,
        canal: d.canal,
        actor: email,
        porAdmin: true,
        estadoInicial: d.confirmada ? 'confirmada' : 'pendiente',
        autorizacionDatosVersion: POLITICA_DATOS.version,
      },
      ahora(),
    );
    if (!r.ok) return { ok: false, error: r.motivo };
    await publish('reserva.creada', { reservaId: r.id, canal: d.canal });
    refrescar();
    return { ok: true, mensaje: `Reserva ${r.codigo} registrada.` };
  });
}

// ─── Horarios ──────────────────────────────────────────────────────

export async function crearHorariosAction(_previo: EstadoFormAdmin, formData: FormData): Promise<EstadoFormAdmin> {
  return comoAdmin(async () => {
    const parsed = horarioNuevoSchema.safeParse({
      dias: formData.getAll('dias'),
      hora: formData.get('hora'),
      capacidad: formData.get('capacidad'),
    });
    if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
    const n = await crearHorarios(parsed.data.dias, parsed.data.hora, parsed.data.capacidad);
    refrescar();
    const repetidas = parsed.data.dias.length - n;
    return {
      ok: true,
      mensaje: `${n} franja${n === 1 ? '' : 's'} creada${n === 1 ? '' : 's'}${repetidas ? ` (${repetidas} ya existía${repetidas === 1 ? '' : 'n'})` : ''}.`,
    };
  });
}

export async function actualizarHorarioAction(id: string, cambios: { capacidad?: number; activo?: boolean }): Promise<ResultadoAdmin> {
  return comoAdmin(async () => {
    if (typeof id !== 'string') return { ok: false, error: 'Datos inválidos' };
    const limpio: { capacidad?: number; activo?: boolean } = {};
    if (cambios.capacidad !== undefined) {
      if (!Number.isInteger(cambios.capacidad) || cambios.capacidad < 1 || cambios.capacidad > 100) {
        return { ok: false, error: 'Capacidad entre 1 y 100' };
      }
      limpio.capacidad = cambios.capacidad;
    }
    if (typeof cambios.activo === 'boolean') limpio.activo = cambios.activo;
    await actualizarHorario(id, limpio);
    refrescar();
    return { ok: true };
  });
}

export async function eliminarHorarioAction(id: string): Promise<ResultadoAdmin> {
  return comoAdmin(async () => {
    if (typeof id !== 'string') return { ok: false, error: 'Datos inválidos' };
    await eliminarHorario(id);
    refrescar();
    return { ok: true, mensaje: 'Franja eliminada. Las reservas ya hechas en ese horario se mantienen.' };
  });
}

// ─── Bloqueos ──────────────────────────────────────────────────────

export async function crearBloqueoAction(_previo: EstadoFormAdmin, formData: FormData): Promise<EstadoFormAdmin> {
  return comoAdmin(async () => {
    const parsed = bloqueoSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
    await crearBloqueo(parsed.data.fecha, parsed.data.hora, parsed.data.motivo);
    refrescar();
    return { ok: true, mensaje: 'Bloqueo creado. Las reservas ya existentes no se cancelan automáticamente.' };
  });
}

export async function eliminarBloqueoAction(id: string): Promise<ResultadoAdmin> {
  return comoAdmin(async () => {
    if (typeof id !== 'string') return { ok: false, error: 'Datos inválidos' };
    await eliminarBloqueo(id);
    refrescar();
    return { ok: true };
  });
}

// ─── Ajustes y experiencias ────────────────────────────────────────

export async function guardarAjustesAction(_previo: EstadoFormAdmin, formData: FormData): Promise<EstadoFormAdmin> {
  return comoAdmin(async () => {
    const parsed = ajustesSchema.safeParse({
      ...Object.fromEntries(formData),
      cerrarFestivos: formData.get('cerrarFestivos') === 'on',
    });
    if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
    await guardarAjustes(parsed.data);
    refrescar();
    return { ok: true, mensaje: 'Reglas guardadas.' };
  });
}

export async function guardarExperienciaAction(_previo: EstadoFormAdmin, formData: FormData): Promise<EstadoFormAdmin> {
  return comoAdmin(async () => {
    const parsed = experienciaSchema.safeParse({
      ...Object.fromEntries(formData),
      activa: formData.get('activa') === 'on',
    });
    if (!parsed.success) return { ok: false, error: primerError(parsed.error) };
    const { id, ...cambios } = parsed.data;
    await actualizarExperiencia(id, cambios);
    refrescar();
    revalidatePath('/reservar');
    revalidatePath('/'); // la home muestra precios y textos de las experiencias
    return { ok: true, mensaje: 'Experiencia guardada.' };
  });
}
