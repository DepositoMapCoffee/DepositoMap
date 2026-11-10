import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CalendarDays, LayoutDashboard, Package } from 'lucide-react';
import { Container } from '@/shared/ui';
import { BotonSalir, usuarioOIngresar } from '@/modules/identidad';
import { favoritosDe, ListaFavoritos } from '@/modules/catalogo';

export const metadata: Metadata = { title: 'Mi cuenta | El Depósito', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const ACCESOS_PANEL = [
  { href: '/panel/reservas', icono: CalendarDays, titulo: 'Agenda', texto: 'Reservas del día y la semana' },
  { href: '/panel/catalogo', icono: Package, titulo: 'Catálogo', texto: 'Cafés y chocolates del mapa' },
  { href: '/panel/configuracion', icono: LayoutDashboard, titulo: 'Configuración', texto: 'Horarios, cierres y experiencias' },
];

export default async function PaginaCuenta() {
  const usuario = await usuarioOIngresar('/cuenta');
  const favoritos = await favoritosDe(usuario.id);

  return (
    <Container size="lg" className="pt-10 sm:pt-14 space-y-12">
      <header className="flex flex-wrap items-end justify-between gap-4 animate-entrar">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-accent-hover">Mi cuenta</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-on-surface mt-3">Hola de nuevo</h1>
          <p className="text-on-surface-muted mt-2 break-all">{usuario.email}</p>
        </div>
        <BotonSalir />
      </header>

      {usuario.esAdmin && (
        <section aria-labelledby="titulo-panel" className="animate-entrar">
          <h2 id="titulo-panel" className="font-serif text-2xl text-on-surface mb-5">
            Panel administrativo
          </h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {ACCESOS_PANEL.map(({ href, icono: Icono, titulo, texto }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-[var(--radius-lg)] border border-primary/30 bg-primary-soft/40 p-5 hover:border-primary/60 hover:shadow-[var(--shadow-glow)] transition-[border-color,box-shadow]"
              >
                <Icono className="w-5 h-5 text-primary" />
                <p className="font-medium text-on-surface mt-3 flex items-center gap-1">
                  {titulo} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </p>
                <p className="text-sm text-on-surface-muted mt-1">{texto}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="titulo-favoritos">
        <h2 id="titulo-favoritos" className="font-serif text-2xl text-on-surface mb-5">
          Mis cafés favoritos
        </h2>
        <ListaFavoritos productos={favoritos} />
      </section>
    </Container>
  );
}
