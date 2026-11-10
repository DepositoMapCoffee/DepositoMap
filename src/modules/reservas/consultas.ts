/**
 * Consultas de servidor para las páginas (Server Components).
 * Se exponen por index.ts; no son server actions.
 */
import 'server-only';
import { serverEnv } from '@/shared/config/env';
import { puedeCancelarCliente } from './domain/reglas';
import { ahoraEnZona, esFechaValida, semanaDe } from './domain/tiempo';
import { listarExperienciasActivas, obtenerAjustes, reservaConToken } from './data/repositorio';
import {
  agendaEntre,
  contarPendientesDesde,
  listarBloqueosDesde,
  listarExperienciasAdmin,
  listarHorarios,
} from './data/admin';
import { adminOIngresar } from '@/modules/identidad';

/** Experiencias visibles (para la home y cualquier vitrina pública). */
export async function experienciasPublicas() {
  return listarExperienciasActivas();
}

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

// ─── Panel administrativo ─────────────────────────────────────────


/** Datos de la agenda semanal. `dia` = día seleccionado (por defecto hoy). */
export async function datosAgenda(dia?: string) {
  await adminOIngresar();
  const zona = serverEnv().BUSINESS_TIMEZONE;
  const hoy = ahoraEnZona(zona).fecha;
  const seleccionado = dia && esFechaValida(dia) ? dia : hoy;
  const semana = semanaDe(seleccionado);
  const [reservas, horarios, pendientes] = await Promise.all([
    agendaEntre(semana[0], semana[6]),
    listarHorarios(),
    contarPendientesDesde(hoy),
  ]);
  return { hoy, seleccionado, semana, reservas, horarios: horarios.filter((h) => h.activo), pendientes };
}

/** Datos para el formulario de reserva manual. */
export async function datosReservaManual() {
  await adminOIngresar();
  const hoy = ahoraEnZona(serverEnv().BUSINESS_TIMEZONE).fecha;
  const experiencias = (await listarExperienciasAdmin()).filter((e) => e.activa);
  return { hoy, experiencias };
}

/** Datos de la pantalla de configuración. */
export async function datosConfiguracion() {
  await adminOIngresar();
  const hoy = ahoraEnZona(serverEnv().BUSINESS_TIMEZONE).fecha;
  const [horarios, bloqueos, ajustes, experiencias] = await Promise.all([
    listarHorarios(),
    listarBloqueosDesde(hoy),
    obtenerAjustes(),
    listarExperienciasAdmin(),
  ]);
  return { hoy, horarios, bloqueos, ajustes, experiencias };
}
