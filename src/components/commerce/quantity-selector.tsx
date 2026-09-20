"use client";

import { useId } from "react";
import { cn } from "@/lib/utils/cn";

type QuantitySelectorProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
};

/**
 * A real number input flanked by two buttons. The input stays reachable so a
 * keyboard or screen-reader user can type a quantity instead of pressing "+"
 * repeatedly.
 */
export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  label = "Quantity",
  className,
}: QuantitySelectorProps) {
  const id = useId();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className={cn("inline-flex items-center", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="inline-flex items-stretch overflow-hidden rounded-[var(--radius)] border border-border-strong">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={disabled || value <= min}
          onClick={() => onChange(clamp(value - 1))}
          className="flex h-11 w-11 items-center justify-center text-lg text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          &minus;
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            onChange(Number.isNaN(parsed) ? min : clamp(parsed));
          }}
          className={cn(
            "h-11 w-14 border-x border-border-strong bg-background text-center text-sm",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
        />
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={disabled || value >= max}
          onClick={() => onChange(clamp(value + 1))}
          className="flex h-11 w-11 items-center justify-center text-lg text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}
