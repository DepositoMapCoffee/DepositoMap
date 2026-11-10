'use server';

/**
 * Server actions públicas del motor de reservas.
 *
 * Son invocables desde fuera de la UI (son endpoints POST), así que TODO
 * se valida aquí: formato con Zod y reglas de negocio con el dominio.
 */
import { publish } from '@/shared/events';
import { POLITICA_DATOS } from '@/shared/config/negocio';
import { serverEnv } from '@/shared/config/env';
import { calendarioMes, franjasDelDia } from '../domain/disponibilidad';
import { puedeCancelarCliente } from '../domain/reglas';
import { ahoraEnZona, esFechaValida, esMesValido, rangoMes } from '../domain/tiempo';
import type { DiaCalendario, Franja } from '../domain/tipos';
import { erroresDeZod, solicitudReservaSchema, type ErroresCampos } from '../domain/validacion';
import { cambiarEstado, contextoDisponibilidad, crearReserva, obtenerAjustes, reservaConToken } from '../data/repositorio';
import '../events';

function ahora() {
  return ahoraEnZona(serverEnv().BUSINESS_TIMEZONE);
}

export async function obtenerCalendario(mes: string): Promise<DiaCalendario[]> {
  if (!esMesValido(mes)) return [];
  const { desde, hasta } = rangoMes(mes);
  const ctx = await contextoDisponibilidad(desde, hasta, ahora());
  return calendarioMes(mes, ctx);
}

export async function obtenerFranjas(fecha: string): Promise<Franja[]> {
  if (!esFechaValida(fecha)) return [];
  const ctx = await contextoDisponibilidad(fecha, fecha, ahora());
  return franjasDelDia(fecha, ctx);
}

export type EstadoReservar =
  | { estado: 'inicial' }
  | { estado: 'error'; errores: ErroresCampos }
  | { estado: 'exito'; codigo: string; token: string | null };

/** Crea una reserva desde el formulario público (compatible con useActionState). */
export async function reservar(_previo: EstadoReservar, formData: FormData): Promise<EstadoReservar> {
  const parsed = solicitudReservaSchema.safeParse({
    ...Object.fromEntries(formData),
    aceptaDatos: formData.get('aceptaDatos') === 'on',
  });
  if (!parsed.success) return { estado: 'error', errores: erroresDeZod(parsed.error) };

  const datos = parsed.data;
  try {
    const resultado = await crearReserva(
      {
        experienciaId: datos.experienciaId,
        fecha: datos.fecha,
        hora: datos.hora,
        cupos: datos.cupos,
        idioma: datos.idioma,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        notas: datos.notas,
        canal: 'web',
        idempotencyKey: datos.idempotencyKey,
        actor: 'cliente',
        autorizacionDatosVersion: POLITICA_DATOS.version,
      },
      ahora(),
    );

    if (!resultado.ok) return { estado: 'error', errores: { general: resultado.motivo } };
    if (!resultado.duplicada) await publish('reserva.creada', { reservaId: resultado.id, canal: 'web' });
    return { estado: 'exito', codigo: resultado.codigo, token: resultado.token };
  } catch (error) {
    console.error('[reservas] Error creando reserva:', error);
    return {
      estado: 'error',
      errores: { general: 'No pudimos completar la reserva. Inténtalo de nuevo en unos minutos.' },
    };
  }
}

export type ResultadoCancelar = { ok: true } | { ok: false; motivo: string };

/** Cancelación por el cliente desde su enlace de gestión. */
export async function cancelarReserva(codigo: string, token: string): Promise<ResultadoCancelar> {
  if (typeof codigo !== 'string' || typeof token !== 'string' || !codigo || !token) {
    return { ok: false, motivo: 'Enlace inválido.' };
  }
  const reserva = await reservaConToken(codigo, token);
  if (!reserva) return { ok: false, motivo: 'Enlace inválido o vencido.' };

  const ajustes = await obtenerAjustes();
  const permitido = puedeCancelarCliente(reserva, ahora(), ajustes.horasMinCancelacion);
  if (!permitido.ok) return permitido;

  const hecho = await cambiarEstado(reserva.id, reserva.estado, 'cancelada', 'cliente', 'Cancelada desde el enlace de gestión');
  if (!hecho) return { ok: false, motivo: 'La reserva cambió mientras tanto. Recarga la página.' };

  await publish('reserva.cancelada', { reservaId: reserva.id, motivo: 'cliente' });
  return { ok: true };
}
