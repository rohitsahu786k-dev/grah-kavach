"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type ToastTone = "neutral" | "success" | "warning" | "danger";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const tones: Record<ToastTone, string> = {
  neutral: "bg-foreground text-background",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
};

let nextId = 0;

/**
 * Wrap the part of the tree that needs transient messages. The live region is
 * always mounted, not created on demand — a region inserted at the same moment
 * as its text is frequently not announced.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = "neutral") => {
    const id = nextId++;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        /*
         * Above the drawer (z-50) so a cart message is not hidden behind it,
         * and lifted clear of the fixed tab bar on phones — a toast covering
         * the navigation is a toast covering the way out.
         */
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex flex-col items-center gap-2 p-4 pb-[calc(var(--gk-bottom-nav-h)+env(safe-area-inset-bottom,0px)+1rem)] lg:items-end lg:pb-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto w-full max-w-sm rounded-[var(--radius)] px-4 py-3 text-sm shadow-lg",
              tones[toast.tone],
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside a <ToastProvider>.");
  }
  return context;
}
