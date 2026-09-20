import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type FeatureCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  /** Small accent label, e.g. a component's role in the kit. */
  eyebrow?: string;
  className?: string;
};

/** A titled block of explanatory content. Not clickable by design. */
export function FeatureCard({ title, description, icon, eyebrow, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius)] border border-border bg-background p-5 lg:p-6",
        className,
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary"
        >
          {icon}
        </div>
      )}
      {eyebrow && (
        <span className="text-xs font-medium uppercase tracking-wide text-secondary-hover">
          {eyebrow}
        </span>
      )}
      <h3 className="text-base font-medium leading-snug text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-foreground-muted">{description}</p>
    </div>
  );
}
