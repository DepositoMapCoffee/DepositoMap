/**
 * Registro central de módulos.
 *
 * Aquí se "enchufan" las piezas Lego que reaccionan a eventos. Para
 * desactivar un módulo basta con comentar su línea; para agregar uno,
 * se añade su registrarSuscriptores().
 *
 * Se invoca desde src/instrumentation.ts (una vez por proceso de servidor).
 */
import { registrarSuscriptores as notificaciones } from '@/modules/notificaciones/subscribers';

let registrado = false;

export function registrarModulos(): void {
  if (registrado) return;
  registrado = true;
  notificaciones();
}
