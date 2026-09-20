import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "./heading";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Shown when something actually failed. role="alert" so it is announced
 * immediately — distinct from EmptyState, which is a normal, expected outcome.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this just now. Please try again in a moment.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius)] border border-danger/25",
        "bg-danger-subtle px-6 py-12 text-center lg:py-16",
        className,
      )}
    >
      <Heading level={2} size="sm" className="text-danger">
        {title}
      </Heading>
      <p className="mt-2 max-w-[48ch] text-sm text-foreground-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
