/**
 * Bus de eventos interno (en proceso, sin servicios externos).
 *
 * Es el "pegamento" de las piezas Lego: un módulo PUBLICA un evento sin
 * saber quién lo escucha; otros módulos se SUSCRIBEN sin que el emisor
 * cambie. Así se agregan canales (correo, WhatsApp, chatbot…) sin tocar
 * el motor de reservas.
 *
 * Cada módulo declara sus eventos ampliando `EventMap`:
 *
 *   declare module '@/shared/events' {
 *     interface EventMap {
 *       'reserva.creada': { reservaId: string; canal: string };
 *     }
 *   }
 *
 * Los suscriptores se registran en src/modules/<modulo>/subscribers.ts y
 * se cargan una sola vez desde src/bootstrap/registry.ts.
 *
 * Nota VPS: si en el futuro se necesitan reintentos o procesos aparte,
 * solo cambia la implementación de `publish` (p. ej. a una cola en
 * Postgres); la API para los módulos se mantiene.
 */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface EventMap {}

export type EventName = keyof EventMap;
type Handler<K extends EventName> = (payload: EventMap[K]) => void | Promise<void>;

const handlers = new Map<EventName, Set<Handler<EventName>>>();

/** Suscribe un manejador. Devuelve la función para desuscribirlo. */
export function subscribe<K extends EventName>(event: K, handler: Handler<K>): () => void {
  const set = handlers.get(event) ?? new Set();
  set.add(handler as Handler<EventName>);
  handlers.set(event, set);
  return () => set.delete(handler as Handler<EventName>);
}

/**
 * Publica un evento. Los manejadores corren en paralelo y un fallo en uno
 * NO afecta al emisor ni a los demás (p. ej. si falla el correo, la
 * reserva igual queda creada).
 */
export async function publish<K extends EventName>(event: K, payload: EventMap[K]): Promise<void> {
  const set = handlers.get(event);
  if (!set?.size) return;
  // `async` envuelve también los errores síncronos (un throw directo) en
  // una promesa rechazada, para que allSettled los aísle.
  const results = await Promise.allSettled([...set].map(async (h) => h(payload)));
  for (const r of results) {
    if (r.status === 'rejected') {
      console.error(`[events] Manejador de "${String(event)}" falló:`, r.reason);
    }
  }
}
