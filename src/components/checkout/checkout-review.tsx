"use client";

import Image from "next/image";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import type { ValidatedCart } from "@/lib/cart/types";

type CheckoutReviewProps = {
  cart: ValidatedCart;
};

export function CheckoutReview({ cart }: CheckoutReviewProps) {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:p-8">
      <h3 className="text-lg font-medium text-foreground">Order Review</h3>

      {/* Item list */}
      <div className="mt-4 divide-y divide-border">
        {cart.items.map((item) => (
          <div key={item.productId} className="flex items-center gap-3.5 py-3.5 first:pt-0 last:pb-0">
            <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-stone-50">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[10px] text-stone-400">
                  No img
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="truncate text-sm font-medium text-foreground">
                {item.name}
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Qty: {item.quantity} × {formatMinorUnitsToCurrency(item.unitPriceMinor, cart.currency)}
              </p>
            </div>

            <span className="text-sm font-semibold text-foreground">
              {formatMinorUnitsToCurrency(item.lineSubtotalMinor, cart.currency)}
            </span>
          </div>
        ))}
      </div>

      {/* Breakdown */}
      <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            {formatMinorUnitsToCurrency(cart.subtotalMinor, cart.currency)}
          </span>
        </div>

        {cart.discountMinor > 0 ? (
          <div className="flex justify-between text-emerald-700">
            <span>Coupon ({cart.coupon?.code.toUpperCase()})</span>
            <span className="font-medium">
              -{formatMinorUnitsToCurrency(cart.discountMinor, cart.currency)}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="font-medium text-foreground">
            {cart.shippingMinor > 0
              ? formatMinorUnitsToCurrency(cart.shippingMinor, cart.currency)
              : "FREE"}
          </span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span>Estimated Taxes</span>
          <span className="font-medium text-foreground">
            {cart.taxMinor > 0
              ? formatMinorUnitsToCurrency(cart.taxMinor, cart.currency)
              : "₹0"}
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-4 text-base font-semibold text-foreground">
          <span>Total Payable</span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            {formatMinorUnitsToCurrency(cart.totalMinor, cart.currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
