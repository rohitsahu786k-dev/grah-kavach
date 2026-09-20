"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon, CheckIcon, SpinnerIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useCart } from "@/lib/cart/cart-context";
import { useCommerceUI } from "@/lib/commerce/ui-context";
import type { Size } from "@/types";

type Props = {
  productId: number;
  productName?: string;
  quantity?: number;
  disabled?: boolean;
  /** Out-of-stock and unpublished products say why instead of failing silently. */
  unavailableLabel?: string;
  label?: string;
  size?: Size;
  variant?: "primary" | "outline";
  fullWidth?: boolean;
  className?: string;
};

/*
 * The one add-to-cart control on the site.
 *
 * It adds the item, opens the drawer, and lets the drawer confirm price and
 * stock against WooCommerce — so the customer sees the authoritative numbers
 * immediately rather than a locally computed guess. Repeat presses inside the
 * settle window are ignored: a double-tap on a phone should add one kit, not
 * two.
 */
export function AddToCartButton({
  productId,
  productName = "Fire Safety Kit",
  quantity = 1,
  disabled = false,
  unavailableLabel = "Out of stock",
  label = "Add to Cart",
  size = "md",
  variant = "primary",
  fullWidth = false,
  className,
}: Props) {
  const { addItem } = useCart();
  const { openCart } = useCommerceUI();
  const { notify } = useToast();

  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const lockedUntil = useRef(0);

  if (disabled) {
    return (
      <Button disabled size={size} fullWidth={fullWidth} className={className}>
        {unavailableLabel}
      </Button>
    );
  }

  function handleClick() {
    const now = Date.now();
    if (now < lockedUntil.current) return;
    lockedUntil.current = now + 700;

    setState("busy");
    addItem(productId, quantity);

    // A beat of "adding" before the drawer arrives: an instant panel with no
    // acknowledgement reads as if the press did nothing.
    window.setTimeout(() => {
      openCart();
      setState("done");
      notify(
        quantity > 1
          ? `Added ${quantity} × ${productName} to your cart.`
          : `Added ${productName} to your cart.`,
        "success",
      );
      window.setTimeout(() => setState("idle"), 1600);
    }, 180);
  }

  return (
    <Button
      onClick={handleClick}
      size={size}
      variant={variant}
      fullWidth={fullWidth}
      aria-live="polite"
      className={className}
    >
      {state === "busy" ? (
        <>
          <SpinnerIcon className="size-4" />
          Adding…
        </>
      ) : state === "done" ? (
        <>
          <CheckIcon className="size-4" />
          Added
        </>
      ) : (
        <>
          <CartIcon className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
