"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AddToCartButton } from "./add-to-cart-button";
import { QuantitySelector } from "./quantity-selector";
import { WishlistButton } from "./wishlist-button";

import { useBuyNow } from "./use-buy-now";

type Props = {
  productId: number;
  productName: string;
  disabled?: boolean;
  /** WooCommerce stock count, when the product tracks inventory. */
  maxQuantity?: number | null;
  showBuyNow?: boolean;
  className?: string;
};

/*
 * Quantity, add to cart, buy now and save — the buying controls, together.
 *
 * Quantity lives here rather than in the cart context because it is a property
 * of this interaction, not of the cart: leaving the page and coming back should
 * start again at one.
 */
export function PurchasePanel({
  productId,
  productName,
  disabled = false,
  maxQuantity,
  showBuyNow = true,
  className,
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const { handleBuyNow: triggerBuyNow } = useBuyNow(productId);

  const max = typeof maxQuantity === "number" && maxQuantity > 0 ? Math.min(maxQuantity, 99) : 99;

  function handleBuyNow() {
    void triggerBuyNow(quantity);
  }

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-3">
        <QuantitySelector
          value={quantity}
          onChange={setQuantity}
          max={max}
          disabled={disabled}
        />

        <AddToCartButton
          productId={productId}
          productName={productName}
          quantity={quantity}
          disabled={disabled}
          size="md"
          variant={showBuyNow ? "outline" : "primary"}
        />

        {showBuyNow && !disabled ? (
          <Button onClick={handleBuyNow}>
            Buy Now
          </Button>
        ) : null}

        <WishlistButton
          productId={productId}
          productName={productName}
          variant="inline"
        />
      </div>
    </div>
  );
}
