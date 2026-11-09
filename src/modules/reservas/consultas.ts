/**
 * Consultas de servidor para las páginas (Server Components).
 * Se exponen por index.ts; no son server actions.
 */
import 'server-only';
import { serverEnv } from '@/shared/config/env';
import { puedeCancelarCliente } from './domain/reglas';
import { ahoraEnZona } from './domain/tiempo';
import { listarExperienciasActivas, obtenerAjustes, reservaConToken } from './data/repositorio';

/** Datos iniciales del flujo /reservar. */
export async function datosParaReservar() {
  const zona = serverEnv().BUSINESS_TIMEZONE;
  const ahora = ahoraEnZona(zona);
  const [experiencias, ajustes] = await Promise.all([listarExperienciasActivas(), obtenerAjustes()]);
  return {
    experiencias,
    cuposMaxPorReserva: ajustes.cuposMaxPorReserva,
    diasMaxFuturo: ajustes.diasMaxFuturo,
    horasMinCancelacion: ajustes.horasMinCancelacion,
    hoy: ahora.fecha,
    zona,
  };
}

/** Reserva para la página de gestión, o null si el enlace no es válido. */
export async function reservaParaGestion(codigo: string, token: string) {
  const reserva = await reservaConToken(codigo, token);
  if (!reserva) return null;
  const ajustes = await obtenerAjustes();
  const cancelable = puedeCancelarCliente(reserva, ahoraEnZona(serverEnv().BUSINESS_TIMEZONE), ajustes.horasMinCancelacion);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...publica } = reserva;
  return { reserva: publica, cancelable };
}
