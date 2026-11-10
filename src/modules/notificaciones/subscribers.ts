/**
 * Suscripciones del módulo `notificaciones`: qué mensaje sale ante cada
 * evento de reservas. Se registran una sola vez desde src/bootstrap/registry.ts.
 *
 *  reserva.creada     → cliente: "recibida" (o "confirmada" si ya entró confirmada)
 *                       equipo : aviso de reserva nueva (solo web / bot)
 *  reserva.confirmada → cliente: "confirmada"
 *  reserva.cancelada  → cliente: "cancelada"; equipo: aviso si canceló el cliente
 *
 * Un fallo al enviar NUNCA afecta a la reserva: el bus de eventos lo aísla
 * y aquí solo se registra en el log.
 */
import { subscribe } from '@/shared/events';
import { publicEnv, serverEnv } from '@/shared/config/env';
import { correosDelNegocio, enviarCorreo } from '@/shared/infra/correo';
import { reservaParaNotificar, type ReservaParaNotificar } from '@/modules/reservas';
import { avisoNegocio, reservaCancelada, reservaConfirmada, reservaRecibida, type Mensaje } from './plantillas/reservas';

const sitio = () => publicEnv().NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
const zona = () => serverEnv().BUSINESS_TIMEZONE;

async function alCliente(r: ReservaParaNotificar, m: Mensaje) {
  if (!r.email) return; // reservas manuales sin correo
  await enviarCorreo({ para: r.email, ...m });
}

async function alEquipo(m: Mensaje) {
  const destinatarios = correosDelNegocio();
  if (destinatarios.length) await enviarCorreo({ para: destinatarios, ...m });
}

/** Ejecuta el envío registrando (sin propagar) cualquier error. */
async function seguro(etiqueta: string, fn: () => Promise<void>) {
  try {
    await fn();
  } catch (error) {
    console.error(`[notificaciones] Falló "${etiqueta}":`, error);
  }
}

export function registrarSuscriptores(): void {
  subscribe('reserva.creada', async ({ reservaId, canal }) => {
    const r = await reservaParaNotificar(reservaId);
    if (!r) return;
    const mensaje = r.estado === 'confirmada' ? reservaConfirmada(r, zona()) : reservaRecibida(r, zona());
    await Promise.all([
      seguro('cliente: reserva creada', () => alCliente(r, mensaje)),
      canal === 'web' || canal === 'bot'
        ? seguro('equipo: reserva nueva', () => alEquipo(avisoNegocio(r, 'nueva', `${sitio()}/panel/reservas?dia=${r.fecha}`)))
        : Promise.resolve(),
    ]);
  });

  subscribe('reserva.confirmada', async ({ reservaId }) => {
    const r = await reservaParaNotificar(reservaId);
    if (r) await seguro('cliente: confirmada', () => alCliente(r, reservaConfirmada(r, zona())));
  });

  subscribe('reserva.cancelada', async ({ reservaId, motivo }) => {
    const r = await reservaParaNotificar(reservaId);
    if (!r) return;
    const porCliente = motivo === 'cliente';
    await Promise.all([
      seguro('cliente: cancelada', () => alCliente(r, reservaCancelada(r, porCliente, `${sitio()}/reservar`))),
      porCliente
        ? seguro('equipo: cancelada', () => alEquipo(avisoNegocio(r, 'cancelada', `${sitio()}/panel/reservas?dia=${r.fecha}`)))
        : Promise.resolve(),
    ]);
  });
}
