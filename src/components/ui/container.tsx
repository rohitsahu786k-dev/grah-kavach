import { cn } from "@/lib/utils/cn";
import type { WithChildren } from "@/types";

type ContainerProps = WithChildren<{
  /**
   * Content width. Sections legitimately differ: reading content wants a
   * narrower measure than a product grid, so this is a choice rather than one
   * global max-width.
   */
  width?: "narrow" | "default" | "wide" | "full";
  as?: "div" | "section" | "header" | "footer" | "main" | "article";
}>;

const widths = {
  narrow: "max-w-[72ch]",
  default: "max-w-[1280px]",
  wide: "max-w-[1400px]",
  full: "max-w-none",
} as const;

/**
 * Horizontal layout boundary. The gutter grows with the viewport so content
 * never touches the edge on a 320px phone, and never floats in a thin column
 * on a large desktop.
 */
export function Container({
  children,
  className,
  width = "default",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 xs:px-5 lg:px-8 xl:px-10",
        widths[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
