import { cn } from "@/lib/utils/cn";
import type { Tone, WithChildren } from "@/types";

type BadgeProps = WithChildren<{
  tone?: Tone;
  size?: "sm" | "md";
}>;

const tones: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  primary: "bg-primary-subtle text-primary",
  secondary: "bg-secondary-subtle text-secondary-hover",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
};

/** A small non-interactive status or category label. */
export function Badge({ children, className, tone = "neutral", size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
