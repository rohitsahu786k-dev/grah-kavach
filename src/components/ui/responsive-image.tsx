import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { Media } from "@/types";

type ResponsiveImageProps = {
  media: Media | null;
  /** Overrides media.alt. Pass "" only for genuinely decorative images. */
  alt?: string;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  aspect?: "square" | "4/3" | "16/9" | "auto";
  fit?: "cover" | "contain";
};

const aspects = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
  auto: "",
} as const;

/**
 * Wraps next/image with a stable aspect box so the layout does not shift while
 * the image loads. `sizes` defaults to a mobile-first chain that matches the
 * container widths used across the site — passing an accurate `sizes` is what
 * stops the browser downloading a 1600px file for a 390px phone.
 */
export function ResponsiveImage({
  media,
  alt,
  sizes = "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw",
  className,
  imageClassName,
  priority = false,
  aspect = "square",
  fit = "contain",
}: ResponsiveImageProps) {
  if (!media?.url) {
    return (
      <div
        aria-hidden="true"
        className={cn("rounded-[var(--radius)] bg-muted", aspects[aspect], className)}
      />
    );
  }

  return (
    <div className={cn("relative overflow-hidden", aspects[aspect], className)}>
      <Image
        src={media.url}
        alt={alt ?? media.alt ?? ""}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(fit === "cover" ? "object-cover" : "object-contain", imageClassName)}
      />
    </div>
  );
}
