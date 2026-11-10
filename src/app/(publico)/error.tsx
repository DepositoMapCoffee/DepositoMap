'use client';

import { buttonStyles, Container } from '@/shared/ui';

/** Error inesperado (p. ej. base de datos no disponible). */
export default function ErrorReservas({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container size="sm" className="py-24 text-center">
      <h1 className="font-serif text-3xl text-on-surface">Algo no salió bien</h1>
      <p className="text-on-surface-muted mt-3">No pudimos cargar las reservas en este momento. Inténtalo de nuevo en unos segundos.</p>
      <button type="button" onClick={reset} className={buttonStyles('primary', 'md', 'mt-8')}>
        Reintentar
      </button>
    </Container>
  );
}
