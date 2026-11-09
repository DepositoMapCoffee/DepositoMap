/**
 * Logo oficial de El Depósito.
 *
 *  - variant="isotipo"  → símbolo solo (/public/Isotipo.svg)
 *  - variant="completo" → símbolo + wordmark (/public/Logo.svg)
 *
 * Se usa <img> porque son SVG vectoriales: next/image no aporta
 * optimización y exigiría habilitar dangerouslyAllowSVG.
 */
import { cn } from '../cn';

type LogoProps = {
  variant?: 'isotipo' | 'completo';
  /** Alto en px; el ancho se calcula con la proporción del SVG. */
  size?: number;
  className?: string;
  /** Si es decorativo (hay texto al lado), se oculta a lectores de pantalla. */
  decorative?: boolean;
};

const RATIO = { isotipo: 220 / 350, completo: 570 / 350 } as const;
const SRC = { isotipo: '/Isotipo.svg', completo: '/Logo.svg' } as const;

export function Logo({ variant = 'isotipo', size = 36, className, decorative = false }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={SRC[variant]}
      width={Math.round(size * RATIO[variant])}
      height={size}
      alt={decorative ? '' : 'El Depósito'}
      aria-hidden={decorative || undefined}
      className={cn('shrink-0 select-none', className)}
      draggable={false}
    />
  );
}
