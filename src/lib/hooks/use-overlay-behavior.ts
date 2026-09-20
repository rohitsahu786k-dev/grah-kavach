"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type Options = {
  open: boolean;
  onClose: () => void;
  /** The panel to trap focus inside. */
  panelRef: RefObject<HTMLElement | null>;
  /** Set false for overlays that should not steal focus (none currently). */
  autoFocus?: boolean;
};

/**
 * The behaviour every modal overlay owes the user, in one place: the page
 * behind stops scrolling, Escape closes, Tab cannot walk out of the panel, and
 * focus returns to whatever opened it.
 *
 * The scrollbar width is added back as padding while the body is locked.
 * Without that compensation, hiding a desktop scrollbar widens the viewport by
 * ~15px and the whole page visibly jumps sideways as the drawer opens.
 */
export function useOverlayBehavior({ open, onClose, panelRef, autoFocus = true }: Options) {
  const restoreTo = useRef<HTMLElement | null>(null);
  // Held in a ref so the lock effect below does not need onClose in its
  // dependency list, which would re-run the whole lock/unlock cycle on every
  // parent render. Updated in its own effect, never during render.
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null || node === document.activeElement);

      if (nodes.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }

      const first = nodes[0];
      const last = nodes[nodes.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    // Deferred a frame: the panel animates in, and focusing an element that is
    // still translated off-screen makes the browser scroll to chase it.
    const timer = window.setTimeout(() => {
      if (!autoFocus) return;
      const target =
        panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
        panelRef.current;
      target?.focus({ preventScroll: true });
    }, 30);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [open, panelRef, autoFocus]);
}
