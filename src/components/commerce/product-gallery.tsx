"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Media } from "@/types";

type ProductGalleryProps = {
  images: Media[];
  alt: string;
};

/*
 * A scroll-snap slider: swipe on phones, arrows and thumbnails on desktop.
 * Native scrolling does the sliding, so touch feels right and nothing needs a
 * drag library; state only tracks which slide is showing.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = images.length;

  const goTo = useCallback(
    (next: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(next, count - 1));
      track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(track.scrollLeft / Math.max(track.clientWidth, 1)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", onScroll);
    };
  }, []);

  if (!count) return <div className="aspect-square w-full bg-muted" aria-hidden="true" />;

  return (
    <div className="min-w-0">
      <div className="relative">
        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory overflow-x-auto border border-border bg-background-subtle [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-roledescription="carousel"
          aria-label={`${alt} images`}
        >
          {images.map((image, i) => (
            <div key={image.url} className="relative aspect-square w-full shrink-0 snap-center">
              <Image
                src={image.url}
                alt={image.alt || alt}
                fill
                priority={i === 0}
                sizes="(max-width: 1023px) 94vw, 50vw"
                className="object-contain p-4"
              />
            </div>
          ))}
        </div>

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow disabled:opacity-40"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === count - 1}
              aria-label="Next image"
              className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/90 text-foreground shadow disabled:opacity-40"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {count > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:gap-3">
          {images.slice(0, 8).map((image, i) => (
            <button
              key={image.url}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "relative aspect-square overflow-hidden border bg-white",
                i === index ? "border-primary" : "border-border",
              )}
            >
              <Image src={image.url} alt="" fill sizes="120px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
