"use client";

import { useEffect, useRef } from "react";
import type { CartItem } from "./types";

type CaptureInput = {
  items: CartItem[];
  phone: string;
  name: string;
  email: string;
};

const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const DEBOUNCE_MS = 2500;

/**
 * Sends a snapshot of the cart to the server once the shopper has typed a valid
 * mobile number, so an abandoned checkout can be followed up on WhatsApp.
 *
 * It only ever fires after the number is complete, is debounced, skips
 * identical snapshots, and swallows every failure: it must never get in the way
 * of checking out.
 */
export function useCartCapture({ items, phone, name, email }: CaptureInput) {
  const lastSent = useRef<string>("");
  const hasCaptured = useRef(false);

  useEffect(() => {
    const digits = phone.replace(/^(\+91|0)/, "").replace(/\D/g, "");
    if (!INDIAN_MOBILE.test(digits)) return;

    // An emptied cart only matters if we previously stored one.
    if (items.length === 0 && !hasCaptured.current) return;

    const payload = JSON.stringify({
      phone: digits,
      name: name.trim(),
      email: email.trim(),
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    });
    if (payload === lastSent.current) return;

    const timer = window.setTimeout(() => {
      lastSent.current = payload;
      hasCaptured.current = items.length > 0;

      void fetch("/api/cart/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Best effort only.
      });
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [items, phone, name, email]);
}
