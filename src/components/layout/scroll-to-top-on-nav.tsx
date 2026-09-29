"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTopOnNav() {
  const pathname = usePathname();

  useEffect(() => {
    // If there is no hash in the URL, ensure page starts at the top
    if (typeof window !== "undefined" && !window.location.hash) {
      window.scrollTo(0, 0);
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return null;
}
