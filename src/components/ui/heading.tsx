import { cn } from "@/lib/utils/cn";
import type { WithChildren } from "@/types";

type HeadingProps = WithChildren<{
  /** Semantic level — chosen for document outline, not for size. */
  level?: 1 | 2 | 3 | 4;
  /** Visual size — set independently so the outline stays correct. */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  balance?: boolean;
}>;

const sizes = {
  xs: "text-base lg:text-lg",
  sm: "text-lg lg:text-xl",
  md: "text-xl lg:text-2xl",
  lg: "text-2xl lg:text-4xl",
  xl: "text-3xl lg:text-5xl",
} as const;

/**
 * Headings use Manrope 500, the heaviest weight loaded. Size and letter-spacing
 * carry the hierarchy instead of weight, because a synthesised 600/700 would
 * look smeared next to real 500.
 */
export function Heading({
  children,
  className,
  level = 2,
  size = "lg",
  balance = true,
}: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn(
        "font-medium leading-tight tracking-[-0.02em] text-foreground",
        sizes[size],
        balance && "text-balance",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
