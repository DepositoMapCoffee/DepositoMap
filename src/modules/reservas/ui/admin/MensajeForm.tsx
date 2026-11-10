import { cn } from '@/shared/ui';
import type { EstadoFormAdmin } from '../../actions/admin';

/** Mensaje de éxito / error de un formulario del panel. */
export function MensajeForm({ estado }: { estado: EstadoFormAdmin }) {
  if (estado.ok === null) return null;
  const texto = estado.ok ? estado.mensaje : estado.error;
  if (!texto) return null;
  return (
    <p role={estado.ok ? 'status' : 'alert'} className={cn('text-sm', estado.ok ? 'text-primary' : 'text-danger')}>
      {texto}
    </p>
  );
}
