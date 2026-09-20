import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type TrustBadgeProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
};

/**
 * A single reassurance point for the trust bar. Deliberately plain: these
 * should state verifiable facts, never invented guarantees or certifications.
 */
export function TrustBadge({ title, description, icon, className }: TrustBadgeProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {icon && (
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-secondary">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
