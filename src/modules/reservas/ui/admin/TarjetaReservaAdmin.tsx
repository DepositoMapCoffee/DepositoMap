'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Mail, MessageCircle, Phone } from 'lucide-react';
import { Badge, Button, cn, type BadgeTone } from '@/shared/ui';
import { cambiarEstadoReserva, verHistorial } from '../../actions/admin';
import { ETIQUETAS_ESTADO } from '../../domain/reglas';
import type { CambioHistorial, Canal, EstadoReserva, ReservaAgenda } from '../../domain/tipos';
import { formatoFechaLarga, formatoHora, formatoPrecio, pluralPersonas } from '../formato';

export const TONO_ESTADO: Record<EstadoReserva, BadgeTone> = {
  pendiente: 'warning',
  confirmada: 'primary',
  completada: 'neutral',
  cancelada: 'danger',
  no_show: 'neutral',
};

export const ETIQUETA_CANAL: Record<Canal, string> = {
  web: 'Web',
  whatsapp: 'WhatsApp',
  telefono: 'Teléfono',
  presencial: 'Presencial',
  bot: 'Bot',
};

/** wa.me necesita el número con indicativo; los celulares colombianos de 10 dígitos llevan 57. */
function enlaceWhatsAppCliente(telefono: string, mensaje: string): string {
  let digitos = telefono.replace(/\D/g, '');
  if (digitos.length === 10 && digitos.startsWith('3')) digitos = `57${digitos}`;
  return `https://wa.me/${digitos}?text=${encodeURIComponent(mensaje)}`;
}

type Accion = { estado: EstadoReserva; etiqueta: string; variante: 'primary' | 'secondary' | 'danger' };

function accionesPara(estado: EstadoReserva, yaOcurrio: boolean): Accion[] {
  if (estado === 'pendiente') {
    return [{ estado: 'confirmada', etiqueta: 'Confirmar', variante: 'primary' }];
  }
  if (estado === 'confirmada' && yaOcurrio) {
    return [
      { estado: 'completada', etiqueta: 'Asistió', variante: 'primary' },
      { estado: 'no_show', etiqueta: 'No asistió', variante: 'secondary' },
    ];
  }
  return [];
}

export function TarjetaReservaAdmin({ reserva: r, hoy }: { reserva: ReservaAgenda; hoy: string }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);
  const [abierta, setAbierta] = useState(false);
  const [historial, setHistorial] = useState<CambioHistorial[] | null>(null);

  const activa = r.estado === 'pendiente' || r.estado === 'confirmada';
  const acciones = accionesPara(r.estado, r.fecha <= hoy);

  const cambiar = (estado: EstadoReserva) => {
    setMensaje(null);
    iniciar(async () => {
      const res = await cambiarEstadoReserva(r.id, estado);
      setMensaje(res.ok ? { ok: true, texto: res.mensaje ?? 'Listo' } : { ok: false, texto: res.error });
      setConfirmandoCancelar(false);
      if (res.ok) {
        setHistorial(null);
        router.refresh();
      }
    });
  };

  const alternarDetalle = () => {
    const abrir = !abierta;
    setAbierta(abrir);
    if (abrir && historial === null) {
      iniciar(async () => setHistorial(await verHistorial(r.id)));
    }
  };

  const saludo = `Hola ${r.nombre.split(' ')[0]}, te escribimos de El Depósito por tu reserva ${r.codigo} del ${formatoFechaLarga(r.fecha).toLowerCase()} a las ${formatoHora(r.horaInicio)}`;

  return (
    <article
      className={cn(
        'rounded-[var(--radius-lg)] border bg-surface-container p-4 sm:p-5 transition-opacity',
        r.estado === 'pendiente' ? 'border-warning/40' : 'border-outline-soft',
        !activa && 'opacity-60',
        pendiente && 'opacity-70',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-medium text-on-surface truncate">{r.nombre}</h4>
          <p className="text-xs text-on-surface-muted mt-0.5">
            <span className="font-mono tracking-wider">{r.codigo}</span> · {ETIQUETA_CANAL[r.canal]}
          </p>
        </div>
        <Badge tone={TONO_ESTADO[r.estado]}>{ETIQUETAS_ESTADO[r.estado]}</Badge>
      </div>

      <p className="text-sm text-on-surface-soft mt-3">
        <strong className="text-on-surface font-medium">{pluralPersonas(r.cupos)}</strong> · {r.experienciaNombre} · {r.idioma}
        <span className="text-accent-hover"> · {formatoPrecio(r.precioUnitario * r.cupos)}</span>
      </p>
      {r.notas && <p className="text-sm text-on-surface-muted mt-2 italic line-clamp-2">“{r.notas}”</p>}

      <div className="flex flex-wrap items-center gap-2 mt-4">
        {acciones.map((a) => (
          <Button key={a.estado} size="sm" variant={a.variante} disabled={pendiente} onClick={() => cambiar(a.estado)}>
            {a.etiqueta}
          </Button>
        ))}
        {activa &&
          (confirmandoCancelar ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="text-xs text-on-surface-muted">¿Cancelar?</span>
              <Button size="sm" variant="danger" disabled={pendiente} onClick={() => cambiar('cancelada')}>
                Sí, cancelar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmandoCancelar(false)}>
                No
              </Button>
            </span>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirmandoCancelar(true)}>
              Cancelar
            </Button>
          ))}

        <span className="ml-auto flex items-center gap-1">
          <a
            href={enlaceWhatsAppCliente(r.telefono, saludo)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Escribir a ${r.nombre} por WhatsApp`}
            className="w-9 h-9 grid place-items-center rounded-full text-on-surface-muted hover:text-primary hover:bg-surface-high transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={alternarDetalle}
            aria-expanded={abierta}
            className="h-9 px-3 inline-flex items-center gap-1 rounded-full text-xs text-on-surface-muted hover:text-on-surface hover:bg-surface-high transition-colors cursor-pointer"
          >
            Detalle <ChevronDown className={cn('w-4 h-4 transition-transform', abierta && 'rotate-180')} />
          </button>
        </span>
      </div>

      {mensaje && (
        <p role="status" className={cn('text-xs mt-3', mensaje.ok ? 'text-primary' : 'text-danger')}>
          {mensaje.texto}
        </p>
      )}

      {abierta && (
        <div className="mt-4 pt-4 border-t border-outline-soft grid sm:grid-cols-2 gap-4 text-sm animate-aparecer">
          <div className="space-y-2">
            <a href={`tel:${r.telefono.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-on-surface-soft hover:text-on-surface">
              <Phone className="w-4 h-4 text-on-surface-muted" /> {r.telefono}
            </a>
            {r.email ? (
              <a href={`mailto:${r.email}`} className="flex items-center gap-2 text-on-surface-soft hover:text-on-surface break-all">
                <Mail className="w-4 h-4 text-on-surface-muted shrink-0" /> {r.email}
              </a>
            ) : (
              <p className="flex items-center gap-2 text-on-surface-muted">
                <Mail className="w-4 h-4" /> Sin correo
              </p>
            )}
            <p className="text-xs text-on-surface-muted">
              Creada el {new Date(r.creadaEn).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' })}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-on-surface-muted mb-2">Historial</p>
            {historial === null ? (
              <p className="text-xs text-on-surface-muted">Cargando…</p>
            ) : (
              <ol className="space-y-1.5">
                {historial.map((h, i) => (
                  <li key={i} className="text-xs text-on-surface-soft">
                    <span className="text-on-surface">{ETIQUETAS_ESTADO[h.estadoNuevo as EstadoReserva] ?? h.estadoNuevo}</span>
                    {' · '}
                    {h.actor === 'cliente' ? 'Cliente' : h.actor}
                    <span className="text-on-surface-muted">
                      {' · '}
                      {new Date(h.fecha).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' })}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
