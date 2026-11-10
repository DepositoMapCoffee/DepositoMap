import type { HTMLAttributes } from 'react';
import { cn } from '../cn';

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'warning' | 'danger';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-high text-on-surface-soft border-outline-soft',
  primary: 'bg-primary-soft text-primary border-primary/30',
  accent:  'bg-accent-soft text-accent-hover border-accent/30',
  warning: 'bg-warning/12 text-warning border-warning/30',
  danger:  'bg-danger-soft text-danger border-danger/30',
};

export function Badge({ tone = 'neutral', className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide',
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
