import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../cn';
import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 font-sans font-medium rounded-[var(--radius-md)] ' +
  'transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-soft)] ' +
  'active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:   'bg-primary text-on-primary hover:bg-primary-hover hover:shadow-[var(--shadow-glow)]',
  secondary: 'bg-surface-high text-on-surface border border-outline-soft hover:border-outline hover:bg-surface-highest',
  ghost:     'text-on-surface-soft hover:text-on-surface hover:bg-surface-high',
  danger:    'bg-danger-soft text-danger border border-danger/30 hover:bg-danger hover:text-white',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-[15px]',
  lg: 'h-13 px-7 text-base',
};

/**
 * Clases de botón reutilizables (p. ej. para <Link> con aspecto de botón).
 */
export function buttonStyles(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra spinner y deshabilita el botón. */
  loading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonStyles(variant, size, className)}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}
