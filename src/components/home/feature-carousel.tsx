"use client";

import Image from "next/image";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

/*
 * The mid-page feature carousel.
 *
 * Images only — no captions, no buttons drawn over the artwork. Two slides
 * sit fully in view at once on a wide screen, with a third peeking in at the
 * edge as an offset preview of what's next — a row you can move through
 * rather than a single full-width takeover.
 *
 * Movement is native scroll-snap, the same mechanism as the hero: real
 * momentum swiping on touch, correct source order for screen readers, and it
 * still works as a scrollable strip if the JavaScript never arrives.
 *
 * The strip loops: a few slides are cloned onto each end of the real list, so
 * autoplay and the arrows can always step "forward" without ever hitting a
 * hard edge. Once a clone drifts to rest, the track is silently rewound to
 * the matching real slide — same artwork, so the jump isn't visible.
 *
 * A mouse can also grab the strip and drag it — touch already gets that for
 * free from native scrolling, a mouse doesn't, so it gets its own pointer
 * handling here.
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
  const [dragging, setDragging] = useState(false);

  const count = slides.length;
  const loop = count > 1;
  // Enough clones to cover the widest peek (~2.x slides visible at once).
  const clones = Math.min(3, count);

  const extended = useMemo(() => {
    if (!loop) return slides;
    return [
      ...slides.slice(-clones).map((slide, i) => ({ ...slide, key: `${slide.key}-pre-${i}` })),
      ...slides,
      ...slides.slice(0, clones).map((slide, i) => ({ ...slide, key: `${slide.key}-post-${i}` })),
    ];
  }, [slides, loop, clones]);

  // The extended-array position the track is (or is animating towards). The
  // source of truth for "which slide comes next" — scroll position confirms
  // and corrects it, rather than the other way round.
  const posRef = useRef(clones);

  const autoplayMs =
    typeof autoplaySeconds === "number" && autoplaySeconds > 0 ? autoplaySeconds * 1000 : 0;

  const scrollToChild = useCallback((target: number, smooth: boolean) => {
    const track = trackRef.current;
    if (!track) return;
    const child = track.children[target] as HTMLElement | undefined;
    if (!child) return;

    track.scrollTo({
      left: child.offsetLeft - track.offsetLeft,
      behavior: smooth && !prefersReducedMotion() ? "smooth" : "auto",
    });
  }, []);

  const goToExtended = useCallback(
    (target: number, smooth = true) => {
      posRef.current = target;
      scrollToChild(target, smooth);
    },
    [scrollToChild],
  );

  /** Public-facing navigation: which real slide (0-based) to show next. */
  const goToReal = useCallback(
    (target: number) => {
      goToExtended(clones + target, true);
    },
    [goToExtended, clones],
  );

  const nearestChild = useCallback((track: HTMLUListElement) => {
    const point = track.scrollLeft + track.offsetLeft;
    let nearest = 0;
    let best = Infinity;
    for (let i = 0; i < track.children.length; i += 1) {
      const child = track.children[i] as HTMLElement;
      const distance = Math.abs(child.offsetLeft - point);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    }
    return nearest;
  }, []);

  // Land on the first real slide before anything paints — no clone flash.
  useLayoutEffect(() => {
    if (!loop) return;
    posRef.current = clones;
    scrollToChild(clones, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extended]);

  /* Scroll position is the source of truth for which slide is active, and —
     once it settles — for silently rewinding out of the cloned padding. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    let settleTimer = 0;

    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!track) return;
        const nearest = nearestChild(track);
        const real = loop ? (((nearest - clones) % count) + count) % count : nearest;
        setIndex(real);

        if (!loop) return;

        window.clearTimeout(settleTimer);
        settleTimer = window.setTimeout(() => {
          if (!track) return;
          const settledAt = nearestChild(track);
          posRef.current = settledAt;

          if (settledAt < clones || settledAt >= clones + count) {
            const realAt = (((settledAt - clones) % count) + count) % count;
            const canonical = clones + realAt;
            posRef.current = canonical;
            scrollToChild(canonical, false);
          }
        }, 140);
      });
    }

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      track.removeEventListener("scroll", handleScroll);
    };
  }, [count, loop, clones, nearestChild, scrollToChild]);

  /* Autoplay: one step forward at a time, forever — the loop means it never
     has to jump back to the start. */
  useEffect(() => {
    if (!autoplayMs || !loop || paused || prefersReducedMotion()) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      goToExtended(posRef.current + 1, true);
    }, autoplayMs);

    return () => window.clearInterval(timer);
  }, [autoplayMs, loop, paused, goToExtended]);

  /* Mouse drag-to-scroll. Touch already gets native momentum scrolling, so
     this only engages for a mouse pointer. */
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const dragMoved = useRef(false);

  const onPointerDown = useCallback((event: React.PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse") return;
    const track = trackRef.current;
    if (!track) return;

    dragMoved.current = false;
    dragStartX.current = event.clientX;
    dragStartScroll.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
    setDragging(true);
    setPaused(true);
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLUListElement>) => {
    if (!dragging) return;
    const track = trackRef.current;
    if (!track) return;

    const delta = event.clientX - dragStartX.current;
    if (Math.abs(delta) > 3) dragMoved.current = true;
    track.scrollLeft = dragStartScroll.current - delta;
  }, [dragging]);

  const endDrag = useCallback(
    (event: React.PointerEvent<HTMLUListElement>) => {
      if (!dragging) return;
      const track = trackRef.current;
      track?.releasePointerCapture(event.pointerId);
      setDragging(false);
      setPaused(false);

      if (track && dragMoved.current) {
        const nearest = nearestChild(track);
        goToExtended(nearest, true);
      }
    },
    [dragging, nearestChild, goToExtended],
  );

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
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <ul
        ref={trackRef}
        tabIndex={0}
        aria-label="Slides, use arrow keys, drag, or swipe"
        className={cn(
          "flex gap-4 px-4 py-3 xs:px-5 sm:gap-5 lg:gap-6 lg:px-8 xl:px-10",
          dragging
            ? "cursor-grabbing overflow-x-auto scroll-auto [scroll-snap-type:none] select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            : "gk-scroll-x cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            goToExtended(posRef.current + 1, true);
          } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            goToExtended(posRef.current - 1, true);
          }
        }}
      >
        {extended.map((slide, position) => (
          <li
            key={slide.key}
            role="group"
            aria-roledescription="slide"
            aria-label={`${(position % count) + 1} of ${count}`}
            // Sized so two slides fill the window on a wide screen with a
            // third peeking in at the edge — a phone gets one slide and a
            // preview of the next.
            className="w-[80vw] shrink-0 snap-start xs:w-[72vw] sm:w-[46vw] lg:w-[38vw] xl:w-[34vw]"
          >
            <div className="relative overflow-hidden rounded-[20px] shadow-[0_20px_45px_-24px_rgba(26,26,26,0.45)]">
              <Image
                src={slide.src}
                alt={slide.alt}
                width={slide.width}
                height={slide.height}
                draggable={false}
                sizes="(max-width: 639px) 80vw, (max-width: 1023px) 46vw, 34vw"
                className="block h-auto w-full rounded-[20px] object-cover"
                style={{ aspectRatio: slide.ratio }}
              />
            </div>
          </li>
        ))}
      </ul>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => goToExtended(posRef.current - 1, true)}
            aria-label="Previous slide"
            className="absolute top-1/2 left-2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white lg:grid xl:left-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="size-5" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => goToExtended(posRef.current + 1, true)}
            aria-label="Next slide"
            className="absolute top-1/2 right-2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-foreground shadow-md backdrop-blur-sm transition hover:bg-white lg:grid xl:right-6"
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
                onClick={() => goToReal(position)}
                aria-label={`Go to slide ${position + 1}`}
                aria-current={position === index ? "true" : undefined}
                className="grid h-7 place-items-center px-1"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-all duration-300",
                    position === index ? "w-6 bg-primary" : "w-1.5 bg-border-strong",
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
