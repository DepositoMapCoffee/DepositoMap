'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Heart, MapPin } from 'lucide-react';
import { buttonStyles, cn } from '@/shared/ui';
import { alternarFavoritoAction } from '../actions/usuario';
import { nombreDepartamento } from '../domain/departamentos';
import type { Producto } from '../domain/tipos';

export function ListaFavoritos({ productos }: { productos: Producto[] }) {
  const [lista, setLista] = useState(productos);
  const [pendiente, iniciar] = useTransition();

  if (lista.length === 0) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-dashed border-outline-soft p-10 text-center">
        <Heart className="w-8 h-8 mx-auto text-on-surface-muted" />
        <p className="text-on-surface mt-4">Todavía no tienes cafés favoritos.</p>
        <p className="text-sm text-on-surface-muted mt-1">Explora el mapa y toca el corazón de los que quieras guardar.</p>
        <Link href="/?seccion=map" className={buttonStyles('secondary', 'md', 'mt-6')}>
          <MapPin className="w-4 h-4" /> Ir al mapa
        </Link>
      </div>
    );
  }

  return (
    <ul className={cn('grid sm:grid-cols-2 gap-3', pendiente && 'opacity-70')}>
      {lista.map((p) => (
        <li key={p.id} className="rounded-[var(--radius-lg)] border border-outline-soft bg-surface-container p-5 flex gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg text-on-surface leading-snug">{p.nombre}</h3>
            <p className="text-sm text-on-surface-muted mt-1">
              {nombreDepartamento(p.departamentoId)}
              {p.finca ? ` · ${p.finca}` : ''}
            </p>
            {p.notas && <p className="text-sm text-accent-hover mt-2">{p.notas}</p>}
          </div>
          <button
            type="button"
            aria-label={`Quitar ${p.nombre} de favoritos`}
            onClick={() =>
              iniciar(async () => {
                const r = await alternarFavoritoAction(p.id);
                if (r.ok && !r.favorito) setLista((l) => l.filter((x) => x.id !== p.id));
              })
            }
            className="w-10 h-10 shrink-0 grid place-items-center rounded-full text-danger hover:bg-danger-soft transition-colors cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-current" />
          </button>
        </li>
      ))}
    </ul>
  );
}
