"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * The homepage banner carousel.
 *
 * Images only. The artwork already carries its own headline, so nothing is
 * drawn on top of it — no gradient scrim, no overlaid copy, no CTA. Slides run
 * the full width of the viewport and keep their own height: the aspect ratio
 * comes from the dimensions WordPress reports for each file, so a banner is
 * shown at exactly the proportions it was designed at.
 *
 * Movement is native scroll-snap rather than a transform track. That gets
 * real momentum swiping on iOS and Android for free, keeps the slides in the
 * accessibility tree in source order, and degrades to a plain scrollable strip
 * if JavaScript never arrives.
 */

export type BannerSlide = {
  key: string;
  alt: string;
  /** Optional destination. Slides without one are not clickable. */
  href: string | null;
  linkLabel: string;
  /** Aspect ratios, as CSS `w / h`, per breakpoint. Prevents layout shift. */
  mobileRatio: string;
  desktopRatio: string;
  /** Pre-computed by next/image on the server. */
  img: React.ImgHTMLAttributes<HTMLImageElement>;
  desktopSrcSet?: string;
  desktopSizes?: string;
};

type Props = {
  slides: BannerSlide[];
  /** Seconds between slides. 0 or undefined turns autoplay off. */
  autoplaySeconds?: number | null;
  label?: string;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function BannerCarousel({ slides, autoplaySeconds, label = "Promotions" }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length;
  const autoplayMs =
    typeof autoplaySeconds === "number" && autoplaySeconds > 0 ? autoplaySeconds * 1000 : 0;

  /** Scrolls the track so `target` is the visible slide. */
  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;

    const slide = track.children[target] as HTMLElement | undefined;
    if (!slide) return;

    track.scrollTo({
      left: slide.offsetLeft - track.offsetLeft,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, []);

  /*
   * The scroll position is the source of truth for which slide is showing —
   * not a counter we increment. A swipe, a trackpad flick and a dot press all
   * move the same scroll offset, so reading it back is the only way the dots
   * stay honest about where the user actually is.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        const width = track.clientWidth || 1;
        setIndex(Math.max(0, Math.min(count - 1, Math.round(track.scrollLeft / width))));
      });
    }

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [count]);

  /* Autoplay. Held while the pointer is over the carousel, while focus is
     inside it, while the tab is hidden, and whenever the user has asked for
     reduced motion. */
  useEffect(() => {
    if (!autoplayMs || count < 2 || paused) return;
    if (prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const track = trackRef.current;
      if (!track) return;

      const width = track.clientWidth || 1;
      const current = Math.round(track.scrollLeft / width);
      const next = (current + 1) % count;

      track.scrollTo({
        left: next * width,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, count, paused]);

  if (count === 0) return null;

  const single = count === 1;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="relative w-full overflow-hidden bg-background-subtle"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className={cn("flex w-full", !single && "gk-scroll-x")}
        // Native horizontal scrolling is the movement mechanism, so the track
        // itself is the scroll container.
        tabIndex={single ? undefined : 0}
        role={single ? undefined : "group"}
        aria-label={single ? undefined : "Banner slides, use arrow keys or swipe"}
        onKeyDown={(event) => {
          if (single) return;
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
          const picture = (
            <picture>
              {slide.desktopSrcSet ? (
                <source
                  media="(min-width: 1024px)"
                  srcSet={slide.desktopSrcSet}
                  sizes={slide.desktopSizes}
                />
              ) : null}
              {/*
                * `h-auto` with an explicit aspect ratio: the banner keeps its
                * own proportions at any width, and the space is reserved
                * before the file arrives so nothing below it jumps.
                */}
              <img
                {...slide.img}
                alt={slide.alt}
                className="block h-auto w-full"
                style={
                  {
                    "--gk-ar-m": slide.mobileRatio,
                    "--gk-ar-d": slide.desktopRatio,
                    aspectRatio: "var(--gk-banner-ar)",
                  } as React.CSSProperties
                }
              />
            </picture>
          );

          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${position + 1} of ${count}`}
              className="gk-banner-slide w-full shrink-0 snap-center snap-always"
            >
              {slide.href ? (
                <Link
                  href={slide.href}
                  aria-label={slide.linkLabel || slide.alt}
                  className="block"
                >
                  {picture}
                </Link>
              ) : (
                picture
              )}
            </div>
          );
        })}
      </div>

      {!single ? (
        <>
          {/* Arrows. Pointer-only: a touch user swipes, and these would sit
              under the thumb at phone width. */}
          <button
            type="button"
            onClick={() => goTo(index === 0 ? count - 1 : index - 1)}
            aria-label="Previous banner"
            className="absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white lg:grid xl:left-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => goTo(index === count - 1 ? 0 : index + 1)}
            aria-label="Next banner"
            className="absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-white lg:grid xl:right-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>

          <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 lg:bottom-5">
            {slides.map((slide, position) => (
              <button
                key={slide.key}
                type="button"
                onClick={() => goTo(position)}
                aria-label={`Go to banner ${position + 1}`}
                aria-current={position === index ? "true" : undefined}
                className={cn(
                  // 28px tall hit area around a 6px dot: the target is large
                  // enough to press without the dot looking heavy.
                  "grid h-7 place-items-center px-1 transition-opacity",
                  position === index ? "opacity-100" : "opacity-60 hover:opacity-90",
                )}
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full bg-white shadow-[0_0_0_1px_rgba(26,26,26,0.18)] transition-all duration-300",
                    position === index ? "w-6 bg-primary" : "w-1.5",
                  )}
                />
              </button>
            ))}

            {autoplayMs ? (
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                aria-label={paused ? "Start banner autoplay" : "Pause banner autoplay"}
                className="ml-1 grid size-7 place-items-center rounded-full bg-white/85 text-foreground shadow-[0_0_0_1px_rgba(26,26,26,0.12)] transition hover:bg-white"
              >
                {paused ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true">
                    <path d="M7 4.5v15l12-7.5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-3" aria-hidden="true">
                    <path d="M7 4.5h3.5v15H7zM13.5 4.5H17v15h-3.5z" />
                  </svg>
                )}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </section>
  );
}
