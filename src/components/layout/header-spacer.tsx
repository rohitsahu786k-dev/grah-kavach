"use client";

import { usePathname } from "next/navigation";
import { overlaysHero } from "@/lib/layout/routes";

/**
 * Reserves the height the fixed header occupies.
 *
 * Routes that draw their first section behind the header get no spacer, so
 * their hero starts at the very top of the viewport. Every other route gets
 * one, which is why no page needs its own top padding and why changing the
 * header height only means changing `--gk-header-h`.
 *
 * The announcement bar is opaque, so even an overlay route has to clear it.
 */
export function HeaderSpacer() {
  const pathname = usePathname();

  if (overlaysHero(pathname)) {
    return <div aria-hidden="true" className="h-[var(--gk-announcement-h)]" />;
  }

  return (
    <div
      aria-hidden="true"
      className="h-[calc(var(--gk-header-h)+var(--gk-announcement-h))]"
    />
  );
}
