"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "./cart-context";
import type { ValidatedCart } from "./types";

/*
 * Turns the stored {productId, quantity} list into real money and real stock.
 *
 * Every surface that shows cart contents — the drawer and the cart page —
 * goes through this one hook. Two copies of this logic is how a drawer ends up
 * showing a subtotal the cart page disagrees with.
 *
 * The fetch is debounced because the quantity stepper fires on every tap; a
 * customer going from 1 to 4 should cost one request, not four. Responses are
 * sequence-checked so a slow earlier reply cannot overwrite a newer one.
 */

type Options = {
  /** Skip network work while the surface is closed. */
  enabled?: boolean;
  debounceMs?: number;
};

type Result = {
  cart: ValidatedCart | null;
  isValidating: boolean;
  error: string | null;
  refresh: () => void;
};

export function useValidatedCart({ enabled = true, debounceMs = 250 }: Options = {}): Result {
  const { items, couponCode, isReady } = useCart();
  const [cart, setCart] = useState<ValidatedCart | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestId = useRef(0);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => setRefreshToken((token) => token + 1), []);

  // Serialised so the effect compares contents rather than array identity,
  // which changes on every render of the provider.
  const signature = JSON.stringify(items);
  const isEmpty = items.length === 0;

  useEffect(() => {
    if (!enabled || !isReady || isEmpty) return;

    const parsedItems: { productId: number; quantity: number }[] = JSON.parse(signature);
    const id = ++requestId.current;

    const timer = window.setTimeout(() => {
      // Flagged as validating when the request actually goes out, not while
      // the debounce is still absorbing taps on the quantity stepper.
      setIsValidating(true);

      fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: parsedItems, couponCode: couponCode || undefined }),
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Validation failed (${response.status})`);
          return (await response.json()) as ValidatedCart;
        })
        .then((data) => {
          // A reply from a superseded request must not land.
          if (id !== requestId.current) return;
          setCart(data);
          setError(null);
        })
        .catch((cause: unknown) => {
          if (id !== requestId.current) return;
          setError(
            cause instanceof Error
              ? "We could not confirm live prices and stock. Please try again."
              : "Something went wrong updating your cart.",
          );
        })
        .finally(() => {
          if (id !== requestId.current) return;
          setIsValidating(false);
        });
    }, debounceMs);

    return () => window.clearTimeout(timer);
  }, [signature, couponCode, enabled, isReady, debounceMs, refreshToken, isEmpty]);

  /*
   * An empty cart is reported as empty without clearing state in an effect:
   * the last response is simply not shown once the last line is removed, and
   * it is replaced the moment something is added again.
   */
  return {
    cart: isEmpty ? null : cart,
    isValidating: isEmpty ? false : isValidating,
    error: isEmpty ? null : error,
    refresh,
  };
}
