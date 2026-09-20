"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/lib/wordpress/adapters";

/*
 * One footer column.
 *
 * On a phone it collapses, because four stacked columns of links is a very
 * long scroll to reach the contact details most people actually came for. From
 * 1024px up it is a plain heading and list, and the disclosure button stops
 * being a button — the breakpoint is read with matchMedia rather than assumed
 * from CSS, so `aria-expanded` never claims a section is collapsed while it is
 * visibly open.
 */
export function FooterNavGroup({ title, links }: { title: string; links: NavItem[] }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [openOnMobile, setOpenOnMobile] = useState(false);

  const expanded = isDesktop || openOnMobile;

  return (
    <div className="border-b border-border/70 py-1 lg:border-0 lg:py-0">
      <h3 className="text-sm">
        <button
          type="button"
          onClick={() => setOpenOnMobile((value) => !value)}
          aria-expanded={isDesktop ? undefined : openOnMobile}
          className={cn(
            "flex min-h-12 w-full items-center justify-between gap-3 text-left font-medium text-foreground",
            "lg:pointer-events-none lg:min-h-0 lg:cursor-default",
          )}
        >
          {title}
          <ChevronDownIcon
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200 lg:hidden",
              openOnMobile && "rotate-180",
            )}
          />
        </button>
      </h3>

      <ul
        className={cn(
          "gap-3 pb-3 text-sm lg:mt-4 lg:grid lg:pb-0",
          expanded ? "grid" : "hidden",
        )}
      >
        {links.map((item) => (
          <li key={`${title}-${item.href}`}>
            <Link
              href={item.href}
              className="gk-gradient-hover inline-flex min-h-9 items-center text-foreground-muted transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
