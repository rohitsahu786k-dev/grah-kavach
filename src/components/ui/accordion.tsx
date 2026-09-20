"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export type AccordionItem = {
  id: string;
  question: ReactNode;
  answer: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Allow several panels open at once. Default is single-open. */
  multiple?: boolean;
  defaultOpenId?: string;
  className?: string;
};

/**
 * Built on native <button> + aria-expanded rather than <details>, because
 * <details> cannot animate reliably and its open state is hard to control
 * from outside the element.
 */
export function Accordion({ items, multiple = false, defaultOpenId, className }: AccordionProps) {
  const baseId = useId();
  const [open, setOpen] = useState<string[]>(defaultOpenId ? [defaultOpenId] : []);

  const toggle = (id: string) => {
    setOpen((current) => {
      const isOpen = current.includes(id);
      if (multiple) {
        return isOpen ? current.filter((x) => x !== id) : [...current, id];
      }
      return isOpen ? [] : [id];
    });
  };

  return (
    <div className={cn("divide-y divide-border border-y border-border", className)}>
      {items.map((item) => {
        const isOpen = open.includes(item.id);
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;

        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 py-4 text-left",
                  "min-h-[44px] font-medium text-foreground transition-colors hover:text-primary lg:py-5",
                )}
              >
                <span className="text-sm lg:text-base">{item.question}</span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 shrink-0 text-xl leading-none text-muted-foreground transition-transform duration-200",
                    isOpen && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="pb-5 text-sm leading-relaxed text-foreground-muted lg:text-base"
            >
              {item.answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
