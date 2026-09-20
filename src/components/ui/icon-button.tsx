import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { Size } from "@/types";

type IconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  /** Required. An icon alone tells a screen reader nothing. */
  label: string;
  icon: ReactNode;
  variant?: "solid" | "outline" | "ghost";
  size?: Size;
};

const variants = {
  solid: "gk-button-gradient text-primary-foreground shadow-sm shadow-primary/20",
  outline: "border border-border-strong bg-background hover:border-primary hover:bg-primary-subtle",
  ghost: "hover:bg-muted",
} as const;

const sizes: Record<Size, string> = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12",
};

/** A square control whose only content is an icon. `label` becomes its accessible name. */
export function IconButton({
  label,
  icon,
  variant = "ghost",
  size = "md",
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius)] text-foreground",
        "transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="contents">
        {icon}
      </span>
    </button>
  );
}
