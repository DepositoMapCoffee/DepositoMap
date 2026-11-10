'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Refresca los datos del servidor cada `segundos` mientras la pestaña está
 * visible (para ver reservas nuevas sin recargar). Sin websockets: funciona
 * igual en Vercel y en el VPS.
 */
export function AutoActualizar({ segundos }: { segundos: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') router.refresh();
    }, segundos * 1000);
    const alVolver = () => document.visibilityState === 'visible' && router.refresh();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [router, segundos]);
  return null;
}
