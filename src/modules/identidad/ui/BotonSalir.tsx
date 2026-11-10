import { LogOut } from 'lucide-react';
import { buttonStyles } from '@/shared/ui';
import { salir } from '../actions/sesion';

/** Cierra la sesión (form + server action: funciona incluso sin JavaScript). */
export function BotonSalir() {
  return (
    <form action={salir}>
      <button type="submit" className={buttonStyles('ghost', 'sm')}>
        <LogOut className="w-4 h-4" /> Salir
      </button>
    </form>
  );
}
