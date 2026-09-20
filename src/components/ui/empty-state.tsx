import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./heading";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

/** Shown when a request succeeded but there is nothing to show. */
export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border",
        "bg-background-subtle px-6 py-12 text-center lg:py-16",
        className,
      )}
    >
      {icon && (
        <div aria-hidden="true" className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <Heading level={2} size="sm">
        {title}
      </Heading>
      {description && (
        <p className="mt-2 max-w-[48ch] text-sm text-foreground-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
