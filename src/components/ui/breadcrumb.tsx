import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export type Crumb = {
  label: string;
  href?: string;
};

/**
 * The final crumb is the current page: it is not a link, and carries
 * aria-current so assistive tech announces it as the location.
 */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
