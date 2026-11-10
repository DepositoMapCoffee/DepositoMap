import { redirect } from 'next/navigation';

/** El ingreso es uno solo para todo el sitio. */
export default function PaginaIngresarPanel() {
  redirect('/ingresar?siguiente=/panel/reservas');
}
