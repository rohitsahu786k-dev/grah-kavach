"use client";

import { useState } from "react";
import Link from "next/link";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import type { ValidatedCart } from "@/lib/cart/types";

type CartSummaryProps = {
  cart: ValidatedCart;
  onApplyCoupon: (code: string) => Promise<void>;
  onRemoveCoupon: () => void;
  isValidating?: boolean;
};

export function CartSummary({
  cart,
  onApplyCoupon,
  onRemoveCoupon,
  isValidating = false,
}: CartSummaryProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      await onApplyCoupon(couponInput.trim());
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const hasItems = cart.items.length > 0;
  const canCheckout = hasItems && !cart.hasErrors && !isValidating;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:p-8">
      <h2 className="text-xl font-medium text-foreground">Order Summary</h2>

      {/* Coupon Code Section */}
      <div className="mt-6 border-t border-border pt-6">
        {cart.coupon ? (
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-sm">
            <div className="flex items-center gap-2">
              <svg
                className="size-4.5 text-emerald-600"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              <div>
                <span className="font-medium uppercase tracking-wider text-emerald-800">
                  {cart.coupon.code}
                </span>
                <span className="ml-2 text-xs text-emerald-700">
                  ({cart.coupon.description})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onRemoveCoupon}
              disabled={isValidating}
              className="text-xs font-medium text-emerald-800 underline hover:text-emerald-950 disabled:opacity-50"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value);
                if (couponError) setCouponError(null);
              }}
              placeholder="Coupon code (e.g. SAFETY10)"
              disabled={couponLoading || isValidating || !hasItems}
              className="flex-1 rounded-lg border border-border-strong px-3.5 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden disabled:bg-muted"
            />
            <button
              type="submit"
              disabled={couponLoading || isValidating || !couponInput.trim() || !hasItems}
              className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            >
              {couponLoading ? "Applying..." : "Apply"}
            </button>
          </form>
        )}

        {couponError ? (
          <p className="mt-2 text-xs text-danger">{couponError}</p>
        ) : null}
      </div>

      {/* Pricing Breakdown */}
      <div className="mt-6 space-y-3.5 border-t border-border pt-6 text-sm">
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span className="font-medium text-foreground">
            {formatMinorUnitsToCurrency(cart.subtotalMinor, cart.currency)}
          </span>
        </div>

        {cart.discountMinor > 0 ? (
          <div className="flex items-center justify-between text-emerald-700">
            <span>Discount ({cart.coupon?.code.toUpperCase()})</span>
            <span className="font-medium">
              -{formatMinorUnitsToCurrency(cart.discountMinor, cart.currency)}
            </span>
          </div>
        ) : null}

        <div className="flex items-start justify-between text-muted-foreground">
          <div>
            <span>Shipping</span>
            {cart.shippingNotice ? (
              <p className="text-[11px] text-muted-foreground/80">{cart.shippingNotice}</p>
            ) : null}
          </div>
          <span className="font-medium text-foreground">
            {cart.shippingMinor > 0
              ? formatMinorUnitsToCurrency(cart.shippingMinor, cart.currency)
              : "FREE"}
          </span>
        </div>

        <div className="flex items-start justify-between text-muted-foreground">
          <div>
            <span>Estimated Tax</span>
            {cart.taxNotice ? (
              <p className="text-[11px] text-muted-foreground/80">{cart.taxNotice}</p>
            ) : null}
          </div>
          <span className="font-medium text-foreground">
            {cart.taxMinor > 0
              ? formatMinorUnitsToCurrency(cart.taxMinor, cart.currency)
              : "₹0"}
          </span>
        </div>

        <div className="flex items-baseline justify-between border-t border-border pt-4 text-base font-medium text-foreground">
          <span>Total Amount</span>
          <div className="text-right">
            <span className="text-2xl font-medium tracking-tight text-foreground">
              {formatMinorUnitsToCurrency(cart.totalMinor, cart.currency)}
            </span>
            <p className="text-[11px] font-normal text-muted-foreground">
              (Inclusive of all applicable charges)
            </p>
          </div>
        </div>
      </div>

      {/* Cart Errors warning if any items are out of stock */}
      {cart.hasErrors ? (
        <div className="mt-6 rounded-lg bg-red-50 p-3.5 text-xs text-danger">
          <p className="font-medium">Please review cart items:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {cart.errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Checkout CTA Button */}
      <div className="mt-8">
        {canCheckout ? (
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-center text-base font-medium text-white shadow-xs transition-colors hover:bg-primary/90"
          >
            <span>Proceed to Checkout</span>
            <svg
              className="size-4.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-stone-200 px-6 py-3.5 text-center text-base font-medium text-stone-400"
          >
            {cart.hasErrors
              ? "Resolve issues to checkout"
              : isValidating
                ? "Updating totals..."
                : "Cart is empty"}
          </button>
        )}
      </div>

      {/* Trust guarantees */}
      <div className="mt-6 border-t border-border/80 pt-6">
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Verified ISI / CE compliant fire equipment</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            <span>Express dispatch with live shipment tracking</span>
          </li>
          <li className="flex items-center gap-2">
            <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>Direct support from Udaipur manufacturing facility</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
