import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '../cn';

const CONTROL =
  'w-full rounded-[var(--radius-md)] bg-surface-low border text-on-surface placeholder:text-on-surface-muted ' +
  'px-4 h-12 text-[15px] transition-[border-color,box-shadow] duration-200 ' +
  'focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-soft)]';

function controlClass(invalid: boolean, className?: string) {
  return cn(CONTROL, invalid ? 'border-danger' : 'border-outline-soft hover:border-outline', className);
}

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  children: (ids: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
};

/**
 * Envoltura accesible de un control: label asociado, ayuda y error
 * enlazados con aria-describedby.
 */
function FieldShell({ label, hint, error, children }: FieldShellProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-on-surface-soft">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && <p id={hintId} className="text-xs text-on-surface-muted">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-xs text-danger">{error}</p>}
    </div>
  );
}

type Common = { label: string; hint?: string; error?: string };

export function TextField({ label, hint, error, className, ...props }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <input id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={controlClass(invalid, className)} {...props} />
      )}
    </FieldShell>
  );
}

export function TextAreaField({ label, hint, error, className, ...props }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={controlClass(invalid, cn('h-auto min-h-28 py-3', className))} {...props} />
      )}
    </FieldShell>
  );
}

export function SelectField({ label, hint, error, className, children, ...props }: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} hint={hint} error={error}>
      {({ id, describedBy, invalid }) => (
        <select id={id} aria-describedby={describedBy} aria-invalid={invalid || undefined} className={controlClass(invalid, cn('pr-10', className))} {...props}>
          {children}
        </select>
      )}
    </FieldShell>
  );
}
