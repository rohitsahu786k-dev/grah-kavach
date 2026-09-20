import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import type { Size } from "@/types";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variants: Record<Variant, string> = {
  primary:
    "gk-button-gradient text-primary-foreground shadow-sm shadow-primary/20",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
  outline:
    "border border-border-strong bg-background text-foreground hover:border-primary hover:bg-primary-subtle",
  ghost: "text-foreground hover:bg-muted",
  danger: "bg-danger text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  // 44px minimum height throughout: the smallest comfortable touch target.
  sm: "min-h-[40px] px-3.5 text-sm gap-1.5",
  md: "min-h-[44px] px-5 text-sm gap-2",
  lg: "min-h-[52px] px-7 text-base gap-2.5",
};

const base =
  "inline-flex items-center justify-center rounded-[var(--radius)] font-medium " +
  "transition-[transform,box-shadow,background-position,color,border-color] duration-200 select-none " +
  "hover:-translate-y-0.5 active:translate-y-0 " +
  "disabled:pointer-events-none disabled:opacity-50 " +
  "aria-disabled:pointer-events-none aria-disabled:opacity-50";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof CommonProps> & { href?: undefined };

type ButtonAsLink = CommonProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof CommonProps | "href"> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * The single button primitive. Renders an anchor when given `href` and a
 * button otherwise, so navigation stays a real link — right-click, middle-click
 * and "open in new tab" keep working, which they do not on a div with onClick.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    className,
    children,
  } = props;

  const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);

  if (props.href !== undefined) {
    const { variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } = props;
    void _v; void _s; void _f; void _c; void _ch;
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, fullWidth: _f, className: _c, children: _ch, ...rest } = props;
  void _v; void _s; void _f; void _c; void _ch;
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
