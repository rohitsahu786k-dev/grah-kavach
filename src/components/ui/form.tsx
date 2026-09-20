import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

const control =
  "w-full rounded-[var(--radius)] border border-border-strong bg-background px-3.5 " +
  "min-h-[44px] text-sm text-foreground placeholder:text-muted-foreground " +
  "transition-colors focus:border-primary disabled:cursor-not-allowed disabled:bg-muted " +
  "aria-[invalid=true]:border-danger";

/**
 * Field wires a label, hint and error to a control by id, so the control has a
 * real accessible name and its error is announced rather than just coloured red.
 */
export function Field({
  id,
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean;
    required?: boolean;
  }) => ReactNode;
  className?: string;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error), required })}

      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input({ className, ...rest }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(control, className)} {...rest} />;
}

export function Textarea({ className, ...rest }: ComponentPropsWithoutRef<"textarea">) {
  return <textarea className={cn(control, "min-h-[120px] py-3 leading-relaxed", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: ComponentPropsWithoutRef<"select">) {
  return (
    <select className={cn(control, "pr-8", className)} {...rest}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  className,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { label: ReactNode }) {
  return (
    <label className={cn("flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm", className)}>
      <input
        type="checkbox"
        className="h-4.5 w-4.5 shrink-0 rounded border-border-strong text-primary accent-[var(--primary)]"
        {...rest}
      />
      <span className="text-foreground">{label}</span>
    </label>
  );
}
