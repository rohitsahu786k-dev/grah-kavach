"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart/use-cart";
import { useValidatedCart } from "@/lib/cart/use-validated-cart";
import { CartEmptyState } from "@/components/cart/cart-empty-state";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { CartSummary } from "@/components/cart/cart-summary";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, setCouponCode, isReady } = useCart();

  /*
   * The same hook the drawer uses, so this page and the drawer can never show
   * different subtotals for the same cart. Changing the coupon updates cart
   * state, which the hook is already watching — there is nothing to refetch
   * by hand.
   */
  const { cart: validatedCart, isValidating, error: fetchError } = useValidatedCart();

  const handleApplyCoupon = async (code: string) => {
    setCouponCode(code);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
  };

  if (!isReady) {
    return (
      <main className="min-h-screen bg-stone-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="h-8 w-48 animate-pulse rounded bg-stone-200" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="h-96 animate-pulse rounded-2xl bg-white p-6" />
            <div className="h-96 animate-pulse rounded-2xl bg-white p-6" />
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-stone-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground">Cart</span>
          </div>

          <h1 className="text-3xl font-medium tracking-tight text-foreground lg:text-4xl">
            Shopping Cart
          </h1>

          <div className="mt-8">
            <CartEmptyState />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/50 py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Cart</span>
        </div>

        {/* Page Title */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-medium tracking-tight text-foreground lg:text-4xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {items.length} {items.length === 1 ? "product" : "products"} in your safety equipment order
            </p>
          </div>

          <Link
            href="/fire-safety-kit"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Add more equipment
          </Link>
        </div>

        {fetchError ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-danger">
            {fetchError}
          </div>
        ) : null}

        {/* Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* Left: Line Items */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-xs lg:p-8">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Product
              </span>
              <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Quantity & Total
              </span>
            </div>

            <div className="divide-y divide-border">
              {(validatedCart?.items ?? []).length > 0
                ? validatedCart!.items.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={(newQty) => updateQuantity(item.productId, newQty)}
                      onRemove={() => removeItem(item.productId)}
                      disabled={isValidating}
                    />
                  ))
                : items.map((item) => (
                    <div key={item.productId} className="py-6 animate-pulse flex justify-between">
                      <div className="h-16 w-48 bg-stone-100 rounded" />
                      <div className="h-10 w-24 bg-stone-100 rounded" />
                    </div>
                  ))}
            </div>

            <div className="mt-6 flex justify-between border-t border-border pt-6 text-sm">
              <button
                type="button"
                onClick={clearCart}
                disabled={isValidating}
                className="text-xs font-medium text-stone-500 underline hover:text-danger disabled:opacity-50"
              >
                Clear Entire Cart
              </button>

              <p className="text-xs text-muted-foreground">
                Prices and stock verified live with WooCommerce
              </p>
            </div>
          </div>

          {/* Right: Cart Summary */}
          {validatedCart ? (
            <div className="lg:sticky lg:top-24">
              <CartSummary
                cart={validatedCart}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                isValidating={isValidating}
              />
            </div>
          ) : (
            <div className="h-96 animate-pulse rounded-2xl bg-white p-6" />
          )}
        </div>
      </div>
    </main>
  );
}
