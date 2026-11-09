import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Resalta la tarjeta (seleccionada / destacada) con el acento verde. */
  highlighted?: boolean;
  /** Padding interno. */
  padding?: 'none' | 'sm' | 'md' | 'lg';
};

const PADDING = { none: '', sm: 'p-4', md: 'p-6', lg: 'p-8' } as const;

export function Card({ highlighted = false, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] bg-surface-container border shadow-[var(--shadow-card)]',
        'transition-[border-color,box-shadow] duration-300 ease-[var(--ease-out-soft)]',
        highlighted ? 'border-primary/60 shadow-[var(--shadow-glow)]' : 'border-outline-soft',
        PADDING[padding],
        className,
      )}
      {...props}
    />
  );
}
