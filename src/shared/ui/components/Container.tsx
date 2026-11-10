import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

const WIDTHS = { sm: 'max-w-2xl', md: 'max-w-4xl', lg: 'max-w-6xl', xl: 'max-w-7xl' } as const;

/** Contenedor centrado con márgenes laterales responsivos. */
export function Container({ size = 'lg', className, ...props }: HTMLAttributes<HTMLDivElement> & { size?: keyof typeof WIDTHS }) {
  return <div className={cn('mx-auto w-full px-5 sm:px-8', WIDTHS[size], className)} {...props} />;
}
