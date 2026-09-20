import { cn } from "@/lib/utils/cn";

/**
 * Loading placeholder. aria-hidden because the shape itself means nothing;
 * the surrounding region should carry aria-busy so the state is announced once
 * rather than as a pile of empty boxes.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("block animate-pulse rounded-md bg-muted", className)}
    />
  );
}

/** A few stacked lines, sized like running text. */
export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-4", i === lines - 1 && "w-3/5")} />
      ))}
    </span>
  );
}
