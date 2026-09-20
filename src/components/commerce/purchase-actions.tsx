"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/cart-context";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantitySelector } from "./quantity-selector";
import { WishlistButton } from "./wishlist-button";

type PurchaseActionsProps = {
  productId: number;
  productName?: string;
  cartUrl?: string;
  checkoutUrl?: string;
  disabled?: boolean;
  maxQuantity?: number | null;
  priceLabel?: string;
  /** Renders the fixed bar that sits above the phone tab bar. */
  mobile?: boolean;
};

/*
 * Buying controls for the product page.
 *
 * Both forms route through the same AddToCartButton as the rest of the site,
 * so adding from here opens the drawer and updates every badge — the product
 * page does not get its own private cart behaviour.
 */
export function PurchaseActions({
  productId,
  productName = "Fire Safety Kit",
  disabled = false,
  maxQuantity,
  priceLabel,
  mobile = false,
}: PurchaseActionsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const max = typeof maxQuantity === "number" && maxQuantity > 0 ? Math.min(maxQuantity, 99) : 99;

  function handleBuyNow() {
    addItem(productId, quantity);
    router.push("/checkout");
  }

  if (mobile) {
    return (
      /*
       * Sits directly on top of the fixed tab bar rather than over it. Both are
       * fixed to the bottom of the viewport, so this one is offset by the tab
       * bar's height plus the home-indicator inset.
       */
      <div className="fixed inset-x-0 bottom-[calc(var(--gk-bottom-nav-h)+env(safe-area-inset-bottom,0px))] z-30 border-t border-border bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(26,26,26,0.07)] lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">{productName}</p>
            {priceLabel ? (
              <p className="truncate text-sm font-medium text-foreground">{priceLabel}</p>
            ) : null}
          </div>

          <AddToCartButton
            productId={productId}
            productName={productName}
            disabled={disabled}
            size="sm"
            variant="outline"
          />

          {!disabled ? (
            <Button size="sm" onClick={handleBuyNow}>
              Buy Now
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <QuantitySelector value={quantity} onChange={setQuantity} max={max} disabled={disabled} />

      <AddToCartButton
        productId={productId}
        productName={productName}
        quantity={quantity}
        disabled={disabled}
        variant="outline"
      />

      {!disabled ? <Button onClick={handleBuyNow}>Buy Now</Button> : null}

      <WishlistButton productId={productId} productName={productName} variant="inline" />
    </div>
  );
}
