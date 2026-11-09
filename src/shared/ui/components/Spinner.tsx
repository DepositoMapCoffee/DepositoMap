import { cn } from '../cn';

/** Indicador de carga en CSS puro (sin JS de animación). */
export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      style={{ width: size, height: size }}
      className={cn(
        'inline-block rounded-full border-2 border-current border-r-transparent animate-spin motion-reduce:animate-none',
        className,
      )}
    />
  );
}
