/**
 * Disparador del cron de recordatorios (una vez al día).
 *
 * - Vercel Cron: configurado en vercel.json; envía `Authorization: Bearer <CRON_SECRET>`.
 * - VPS: añadir al crontab, p. ej. a las 8:00 de Bogotá (13:00 UTC):
 *     0 13 * * *  curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://<dominio>/api/cron/recordatorios
 *
 * No es una API pública: sin el secreto responde 401.
 */
import { timingSafeEqual } from 'node:crypto';
import { serverEnv } from '@/shared/config/env';
import { enviarRecordatoriosDeManana } from '@/modules/notificaciones';

export const dynamic = 'force-dynamic';

function autorizado(cabecera: string | null): boolean {
  const secreto = serverEnv().CRON_SECRET;
  if (!secreto || !cabecera) return false;
  const a = Buffer.from(cabecera);
  const b = Buffer.from(`Bearer ${secreto}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!autorizado(request.headers.get('authorization'))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }
  const resumen = await enviarRecordatoriosDeManana();
  console.info('[cron] Recordatorios:', resumen);
  return Response.json(resumen);
}
