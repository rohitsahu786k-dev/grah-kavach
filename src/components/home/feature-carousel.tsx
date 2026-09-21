"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * The mid-page feature carousel.
 *
 * Images only — no captions, no buttons drawn over the artwork. Unlike the
 * hero banner, this one shows the neighbouring slides peeking in at the sides
 * so it reads as a row you can move through rather than a full-width takeover.
 *
 * Movement is native scroll-snap, the same mechanism as the hero: real
 * momentum swiping on touch, correct source order for screen readers, and it
 * still works as a scrollable strip if the JavaScript never arrives.
 */

export type FeatureSlide = {
  key: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  ratio: string;
};

type Props = {
  slides: FeatureSlide[];
  autoplaySeconds?: number | null;
  label?: string;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function FeatureCarousel({ slides, autoplaySeconds, label = "Featured" }: Props) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const autoplayMs =
    typeof autoplaySeconds === "number" && autoplaySeconds > 0 ? autoplaySeconds * 1000 : 0;

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[target] as HTMLElement | undefined;
    if (!slide) return;

    // Centre the slide rather than aligning it left: the peeking neighbours
    // are the point of this layout.
    const left = slide.offsetLeft - (track.clientWidth - slide.clientWidth) / 2;

    track.scrollTo({ left, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, []);

  /* Scroll position is the source of truth for which slide is active. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        const centre = track.scrollLeft + track.clientWidth / 2;
        let nearest = 0;
        let best = Infinity;

        for (let i = 0; i < track.children.length; i += 1) {
          const child = track.children[i] as HTMLElement;
          const distance = Math.abs(child.offsetLeft + child.clientWidth / 2 - centre);
          if (distance < best) {
            best = distance;
            nearest = i;
          }
        }

        setIndex(nearest);
      });
    }

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [count]);

  useEffect(() => {
    if (!autoplayMs || count < 2 || paused || prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setIndex((current) => {
        const next = (current + 1) % count;
        goTo(next);
        return next;
      });
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, count, paused, goTo]);

  if (count === 0) return null;

  return (
    <div
      className="relative"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Slides, use arrow keys or swipe"
        className={cn(
          "gk-scroll-x flex gap-4 py-3 lg:gap-6",
          // Side padding creates the peek: the first and last slides can still
          // reach the centre of the track.
          "px-[8vw] sm:px-[14vw] lg:px-[18vw]",
        )}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goTo(Math.min(count - 1, index + 1));
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goTo(Math.max(0, index - 1));
          }
        }}
      >
        {slides.map((slide, position) => {
          const active = position === index;

          return (
            <li
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${position + 1} of ${count}`}
              className={cn(
                "w-[84vw] shrink-0 snap-center snap-always sm:w-[72vw] lg:w-[64vw] xl:w-[58vw]",
                // The inactive slides sit back slightly so the centre one reads
                // as the one in focus, exactly as a retail carousel does.
                "transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none",
                active ? "scale-100 opacity-100" : "scale-[0.92] opacity-60",
              )}
            >
              <div className="gk-carousel-card relative overflow-hidden rounded-[8px] bg-foreground p-2 shadow-2xl shadow-red-950/10">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  width={slide.width}
                  height={slide.height}
                  sizes="(max-width: 639px) 84vw, (max-width: 1023px) 72vw, 60vw"
                  className="block h-auto w-full rounded-[6px] object-cover"
                  style={{ aspectRatio: slide.ratio }}
                />
                <div
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-0 rounded-[8px] ring-1 ring-inset ring-white/10 transition-opacity",
                    active ? "opacity-100" : "opacity-40",
                  )}
                />
              </div>
            </li>
          );
        })}
      </ul>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index === 0 ? count - 1 : index - 1)}
            aria-label="Previous slide"
            className="gk-carousel-nav absolute top-1/2 left-2 hidden size-12 -translate-y-1/2 place-items-center text-white transition lg:grid xl:left-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => goTo(index === count - 1 ? 0 : index + 1)}
            aria-label="Next slide"
            className="gk-carousel-nav absolute top-1/2 right-2 hidden size-12 -translate-y-1/2 place-items-center text-white transition lg:grid xl:right-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <div className="mt-6 flex items-center justify-center gap-2">
            {slides.map((slide, position) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(position)}
                aria-label={`Go to slide ${position + 1}`}
                aria-current={position === index ? "true" : undefined}
                className="grid h-7 place-items-center px-1"
              >
                <span
                  className={cn(
                    "block h-2.5 w-6 rounded-none transition-all duration-300 [clip-path:polygon(6px_0,100%_0,calc(100%_-_6px)_100%,0_100%)]",
                    position === index ? "bg-primary" : "bg-border-strong",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
