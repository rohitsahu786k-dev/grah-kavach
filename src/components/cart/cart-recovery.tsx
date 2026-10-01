"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/use-cart";

/**
 * Handles the one-click link in a WhatsApp cart reminder (`/cart?recover=<token>`).
 *
 * It restores the saved cart and sends the shopper straight to checkout. It
 * renders nothing, and does nothing unless the URL carries a recovery token.
 */
export function CartRecovery() {
  const router = useRouter();
  const { isReady, clearCart, addItem } = useCart();
  const handled = useRef(false);

  useEffect(() => {
    if (!isReady || handled.current) return;

    const token = new URLSearchParams(window.location.search).get("recover");
    if (!token || !/^[a-f0-9]{32}$/i.test(token)) return;

    handled.current = true;

    void (async () => {
      try {
        const res = await fetch("/api/cart/recover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          const data: { items: { productId: number; quantity: number }[] } = await res.json();
          if (data.items.length > 0) {
            clearCart();
            for (const item of data.items) addItem(item.productId, item.quantity);
            router.replace("/checkout");
            return;
          }
        }
      } catch {
        // Fall through: the shopper keeps whatever is already in their cart.
      }

      router.replace("/cart");
    })();
  }, [isReady, clearCart, addItem, router]);

  return null;
}
