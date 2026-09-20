"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { IconButton } from "./icon-button";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /**
   * "center" is a classic dialog. "bottom" is a mobile drawer and is the right
   * default on phones — a centred dialog on a 390px screen leaves the primary
   * action under the thumb-unfriendly top half.
   */
  variant?: "center" | "bottom" | "side";
  className?: string;
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  variant = "center",
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreTo = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Trap focus inside the dialog and restore it on close. Without this the
  // keyboard walks out of the dialog into the page behind it.
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) return;

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (nodes.length === 0) return;

      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;

    restoreTo.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    const timer = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panelRef.current)?.focus();
    }, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      restoreTo.current?.focus?.();
    };
  }, [open, onKeyDown]);

  if (!open || typeof document === "undefined") return null;

  const panels = {
    center:
      "w-full max-w-lg rounded-[var(--radius)] sm:mx-auto mx-4 max-h-[85vh] top-1/2 -translate-y-1/2 relative",
    bottom: "w-full rounded-t-2xl mt-auto max-h-[85vh]",
    side: "h-full w-full max-w-sm ml-auto rounded-none",
  } as const;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex bg-foreground/40 backdrop-blur-[2px]",
        variant === "bottom" && "items-end",
        variant === "side" && "items-stretch",
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "flex flex-col overflow-hidden bg-background shadow-xl outline-none",
          panels[variant],
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <h2 id={titleId} className="text-base font-medium text-foreground">
            {title}
          </h2>
          <IconButton label="Close" icon={<span className="text-xl leading-none">&times;</span>} onClick={onClose} size="sm" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/** A Modal pinned to the bottom on mobile and the side on larger screens. */
export function Drawer(props: Omit<ModalProps, "variant">) {
  return <Modal {...props} variant="bottom" />;
}
