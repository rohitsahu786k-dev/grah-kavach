import { cn } from "@/lib/utils/cn";
import { Container } from "./container";
import type { WithChildren } from "@/types";

type SectionProps = WithChildren<{
  width?: "narrow" | "default" | "wide" | "full";
  /** Vertical rhythm. Mobile spacing is tighter on purpose, not scaled down. */
  spacing?: "none" | "sm" | "md" | "lg";
  surface?: "default" | "subtle" | "primary";
  id?: string;
  /** Set false to lay out your own container inside. */
  contained?: boolean;
}>;

const spacings = {
  none: "",
  sm: "py-8 lg:py-12",
  md: "py-12 lg:py-20",
  lg: "py-16 lg:py-28",
} as const;

const surfaces = {
  default: "bg-background",
  subtle: "bg-background-subtle",
  primary: "gk-brand-gradient text-primary-foreground",
} as const;

/** A full-bleed band of page with consistent vertical rhythm. */
export function Section({
  children,
  className,
  width = "default",
  spacing = "md",
  surface = "default",
  id,
  contained = true,
}: SectionProps) {
  return (
    <section id={id} className={cn(surfaces[surface], spacings[spacing], className)}>
      {contained ? <Container width={width}>{children}</Container> : children}
    </section>
  );
}
