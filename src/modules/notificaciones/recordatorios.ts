/**
 * Recordatorios del día anterior. Lo dispara un cron una vez al día
 * (Vercel Cron hoy; `cron` del sistema en el VPS) vía /api/cron/recordatorios.
 *
 * Idempotente: cada reserva se marca al enviarse, así que repetir la
 * ejecución el mismo día no duplica correos.
 */
import 'server-only';
import { enviarCorreo } from '@/shared/infra/correo';
import { fechaDeManana, marcarRecordatorioEnviado, reservasParaRecordar } from '@/modules/reservas';
import { recordatorio } from './plantillas/reservas';

export type ResumenRecordatorios = { fecha: string; enviados: number; fallidos: number };

export async function enviarRecordatoriosDeManana(): Promise<ResumenRecordatorios> {
  const fecha = fechaDeManana();
  const pendientes = await reservasParaRecordar(fecha);
  let enviados = 0;
  let fallidos = 0;

  for (const r of pendientes) {
    try {
      await enviarCorreo({ para: r.email!, ...recordatorio(r) });
      await marcarRecordatorioEnviado(r.id);
      enviados++;
    } catch (error) {
      fallidos++;
      console.error(`[recordatorios] Falló ${r.codigo}:`, error);
    }
  }
  return { fecha, enviados, fallidos };
}
