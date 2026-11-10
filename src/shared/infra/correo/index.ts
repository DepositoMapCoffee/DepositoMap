/**
 * Adaptador de correo saliente (solo servidor).
 *
 * Los módulos llaman a `enviarCorreo()` sin saber qué proveedor hay detrás.
 *   - 'consola': desarrollo. No envía nada; registra el correo en el log.
 *   - 'resend' : envío real vía API HTTP de Resend (sin SDK).
 * Para el VPS se puede añadir un proveedor SMTP aquí sin tocar los módulos.
 */
import 'server-only';
import { serverEnv } from '@/shared/config/env';

export type Adjunto = { nombre: string; contenido: string; tipo: string };

export type Correo = {
  para: string | string[];
  asunto: string;
  html: string;
  /** Versión en texto plano (accesibilidad y filtros anti-spam). */
  texto: string;
  responderA?: string;
  adjuntos?: Adjunto[];
};

interface Proveedor {
  enviar(correo: Correo): Promise<void>;
}

const consola: Proveedor = {
  async enviar(c) {
    const para = Array.isArray(c.para) ? c.para.join(', ') : c.para;
    const adjuntos = c.adjuntos?.length ? ` · adjuntos: ${c.adjuntos.map((a) => a.nombre).join(', ')}` : '';
    console.info(`[correo:consola] Para: ${para} · Asunto: "${c.asunto}"${adjuntos}\n${c.texto}\n`);
  },
};

const resend: Proveedor = {
  async enviar(c) {
    const env = serverEnv();
    if (!env.RESEND_API_KEY) throw new Error('[correo] Falta RESEND_API_KEY');
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.EMAIL_REMITENTE,
        to: Array.isArray(c.para) ? c.para : [c.para],
        subject: c.asunto,
        html: c.html,
        text: c.texto,
        reply_to: c.responderA ?? env.EMAIL_RESPONDER_A,
        attachments: c.adjuntos?.map((a) => ({
          filename: a.nombre,
          content: Buffer.from(a.contenido, 'utf8').toString('base64'),
          content_type: a.tipo,
        })),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new Error(`[correo] Resend respondió ${respuesta.status}: ${detalle.slice(0, 300)}`);
    }
  },
};

export async function enviarCorreo(correo: Correo): Promise<void> {
  const proveedor = serverEnv().EMAIL_PROVEEDOR === 'resend' ? resend : consola;
  await proveedor.enviar(correo);
}

/** Destinatarios internos del negocio (EMAIL_AVISOS_NEGOCIO), o lista vacía. */
export function correosDelNegocio(): string[] {
  return (serverEnv().EMAIL_AVISOS_NEGOCIO ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
