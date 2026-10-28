"use client";

import { useEffect } from "react";
import { trackViewContent } from "@/lib/analytics/meta-pixel";

/** Reports the landing page as a product view to Meta, once per visit. */
export function LandingViewTracker({ productId, valueMinor }: { productId: number; valueMinor: number }) {
  useEffect(() => {
    trackViewContent({ id: productId, value: valueMinor / 100, currency: "INR" });
  }, [productId, valueMinor]);

  return null;
}
