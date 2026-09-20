"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
  SpinnerIcon,
  TrashIcon,
  TruckIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart/cart-context";
import { useValidatedCart } from "@/lib/cart/use-validated-cart";
import { useCommerceUI } from "@/lib/commerce/ui-context";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import { cn } from "@/lib/utils/cn";
import type { ValidatedLineItem } from "@/lib/cart/types";
import { useOverlayBehavior } from "@/lib/hooks/use-overlay-behavior";

/*
 * The side cart.
 *
 * Everything shown here comes from /api/cart/validate, which reads WooCommerce
 * on every call: the unit price, the sale price, the stock state and the
 * subtotal are the live ones. Nothing is computed in the browser from a cached
 * figure, and there is no invented urgency — no "only 1 left", no countdown,
 * no fake saving. The only shipping line shown is the one the server reports.
 */

function ThumbnailFallback() {
  return (
    <div
      aria-hidden="true"
      className="grid size-full place-items-center bg-muted text-muted-foreground"
    >
      <CartIcon className="size-5" />
    </div>
  );
}

function LineItem({
  item,
  highlighted,
  busy,
  onQuantity,
  onRemove,
}: {
  item: ValidatedLineItem;
  highlighted: boolean;
  busy: boolean;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  const hasImage = Boolean(item.image) && !item.image.includes("/images/placeholder");
  const onSale =
    typeof item.regularPriceMinor === "number" && item.regularPriceMinor > item.unitPriceMinor;

  // Never offer a stepper beyond what WooCommerce says exists.
  const max = item.stockQuantity ?? Infinity;
  const canIncrease = !busy && item.quantity < max && item.stockStatus !== "outofstock";

  return (
    <li
      className={cn(
        "flex gap-4 rounded-[var(--radius)] px-3 py-4 transition-colors",
        highlighted && "gk-anim-flash",
      )}
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius)] border border-border bg-white">
        {hasImage ? (
          <Image
            src={item.image}
            alt=""
            fill
            sizes="80px"
            className="object-contain p-1.5"
          />
        ) : (
          <ThumbnailFallback />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          {/* Long product names must wrap, not push the remove button off-panel. */}
          <Link
            href="/fire-safety-kit"
            className="text-sm leading-5 font-medium text-foreground hover:text-primary"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={onRemove}
            disabled={busy}
            aria-label={`Remove ${item.name} from cart`}
            className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-muted hover:text-danger disabled:opacity-40"
          >
            <TrashIcon className="size-4" />
          </button>
        </div>

        {item.sku ? (
          <p className="mt-1 text-xs text-muted-foreground">SKU {item.sku}</p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-baseline gap-2 text-sm">
          <span className="font-medium text-foreground">
            {formatMinorUnitsToCurrency(item.unitPriceMinor)}
          </span>
          {onSale ? (
            <span className="text-xs text-muted-foreground line-through">
              {formatMinorUnitsToCurrency(item.regularPriceMinor)}
            </span>
          ) : null}
        </div>

        {item.error ? (
          <p role="alert" className="mt-2 text-xs leading-5 text-danger">
            {item.error}
          </p>
        ) : item.stockStatus === "onbackorder" ? (
          <p className="mt-2 text-xs text-warning">Available on backorder</p>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="inline-flex items-center rounded-[var(--radius)] border border-border">
            <button
              type="button"
              onClick={() => onQuantity(item.quantity - 1)}
              disabled={busy}
              aria-label={`Decrease quantity of ${item.name}`}
              className="grid size-9 place-items-center rounded-l-[var(--radius)] text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <MinusIcon className="size-4" />
            </button>
            <span
              aria-live="polite"
              className="min-w-9 text-center text-sm font-medium tabular-nums"
            >
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantity(item.quantity + 1)}
              disabled={!canIncrease}
              aria-label={`Increase quantity of ${item.name}`}
              className="grid size-9 place-items-center rounded-r-[var(--radius)] text-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              <PlusIcon className="size-4" />
            </button>
          </div>

          <span className="text-sm font-medium text-foreground tabular-nums">
            {formatMinorUnitsToCurrency(item.lineSubtotalMinor)}
          </span>
        </div>
      </div>
    </li>
  );
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-14 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-primary-subtle text-primary">
        <CartIcon className="size-7" />
      </div>
      <p className="mt-5 text-lg font-medium text-foreground">Your cart is empty.</p>
      <p className="mt-2 max-w-xs text-sm leading-6 text-foreground-muted">
        The Graha Kavach kit brings an extinguisher, a fire ball and a fire blanket together in
        one place.
      </p>
      <Button href="/fire-safety-kit" className="mt-6" onClick={onClose}>
        Explore Fire Safety Kit
      </Button>
    </div>
  );
}

function CouponField({
  appliedCode,
  discountMinor,
  onApply,
  onRemove,
  busy,
}: {
  appliedCode: string | null;
  discountMinor: number;
  onApply: (code: string) => void;
  onRemove: () => void;
  busy: boolean;
}) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] bg-success-subtle px-3 py-2.5 text-sm">
        <span className="inline-flex min-w-0 items-center gap-2 text-success">
          <CheckIcon className="size-4 shrink-0" />
          <span className="truncate font-medium">{appliedCode}</span>
          {discountMinor > 0 ? (
            <span className="shrink-0 text-foreground-muted">
              −{formatMinorUnitsToCurrency(discountMinor)}
            </span>
          ) : null}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-danger"
        >
          Remove
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-foreground-muted underline underline-offset-4 transition-colors hover:text-primary"
      >
        Have a coupon code?
      </button>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const code = value.trim();
        if (code) onApply(code);
      }}
    >
      <input
        type="text"
        value={value}
        autoFocus
        onChange={(event) => setValue(event.target.value)}
        placeholder="Coupon code"
        aria-label="Coupon code"
        className="min-h-11 min-w-0 flex-1 rounded-[var(--radius)] border border-border px-3 text-sm outline-none focus-visible:border-primary"
      />
      <Button type="submit" variant="outline" size="sm" disabled={busy || !value.trim()}>
        Apply
      </Button>
    </form>
  );
}

export function CartDrawer() {
  const { isCartOpen, closeCart } = useCommerceUI();
  const {
    items,
    totalItemCount,
    updateQuantity,
    removeItem,
    couponCode,
    setCouponCode,
    lastAddedProductId,
  } = useCart();
  const { cart, isValidating, error } = useValidatedCart({ enabled: isCartOpen });

  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open: isCartOpen, onClose: closeCart, panelRef });

  // The drawer can only be open after an interaction, so it is always closed
  // during server rendering and hydration — the document check is enough, and
  // no "have I mounted yet" state is needed.
  if (!isCartOpen || typeof document === "undefined") return null;

  const lines = cart?.items ?? [];
  // Before the first validation lands there is nothing priced to show, but the
  // stored quantities are known — so show skeleton rows of the right count
  // rather than an empty cart the customer knows is wrong.
  const awaitingFirstLoad = items.length > 0 && !cart;
  const isEmpty = items.length === 0;

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={-1}
        onClick={closeCart}
        className="gk-anim-fade-in absolute inset-0 cursor-default bg-foreground/45"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className={cn(
          "gk-anim-slide-right relative flex h-full w-full flex-col bg-background shadow-2xl outline-none",
          "sm:max-w-[440px] xl:max-w-[468px]",
        )}
      >
        <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-medium text-foreground">Your Cart</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {totalItemCount === 0
                ? "No items yet"
                : `${totalItemCount} ${totalItemCount === 1 ? "item" : "items"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={closeCart}
            data-autofocus
            aria-label="Close cart"
            className="grid size-10 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted"
          >
            <CloseIcon className="size-5" />
          </button>
        </header>

        {isEmpty ? (
          <EmptyCart onClose={closeCart} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto overscroll-contain px-2 py-2">
              {error ? (
                <p
                  role="alert"
                  className="mx-3 my-2 rounded-[var(--radius)] bg-danger-subtle px-3 py-2.5 text-sm text-danger"
                >
                  {error}
                </p>
              ) : null}

              {awaitingFirstLoad ? (
                <ul className="divide-y divide-border">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-4 px-3 py-4">
                      <div className="size-20 shrink-0 animate-pulse rounded-[var(--radius)] bg-muted" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                        <div className="h-9 w-28 animate-pulse rounded bg-muted" />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="divide-y divide-border">
                  {lines.map((line) => (
                    <LineItem
                      key={line.productId}
                      item={line}
                      highlighted={line.productId === lastAddedProductId}
                      busy={isValidating}
                      onQuantity={(quantity) => updateQuantity(line.productId, quantity)}
                      onRemove={() => removeItem(line.productId)}
                    />
                  ))}
                </ul>
              )}
            </div>

            <footer className="border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div className="space-y-3">
                <CouponField
                  appliedCode={cart?.coupon?.code ?? (couponCode || null)}
                  discountMinor={cart?.discountMinor ?? 0}
                  busy={isValidating}
                  onApply={setCouponCode}
                  onRemove={() => setCouponCode("")}
                />

                <div className="flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-sm text-foreground-muted">Subtotal</span>
                  <span className="text-lg font-medium text-foreground tabular-nums">
                    {isValidating && !cart ? (
                      <SpinnerIcon className="size-5 text-muted-foreground" />
                    ) : (
                      formatMinorUnitsToCurrency(cart?.subtotalMinor ?? 0, cart?.currency ?? "INR")
                    )}
                  </span>
                </div>

                {cart?.discountMinor ? (
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-foreground-muted">Discount</span>
                    <span className="text-success tabular-nums">
                      −{formatMinorUnitsToCurrency(cart.discountMinor, cart.currency)}
                    </span>
                  </div>
                ) : null}

                {cart?.shippingNotice ? (
                  <p className="inline-flex items-center gap-2 text-xs text-foreground-muted">
                    <TruckIcon className="size-4 shrink-0 text-muted-foreground" />
                    {cart.shippingNotice}
                  </p>
                ) : null}

                {cart?.hasErrors ? (
                  <p role="alert" className="text-xs leading-5 text-danger">
                    Some items need attention before checkout.
                  </p>
                ) : null}

                <div className="grid gap-2 pt-1">
                  <Button
                    href="/checkout"
                    fullWidth
                    size="lg"
                    onClick={closeCart}
                    aria-disabled={cart?.hasErrors ? true : undefined}
                  >
                    Checkout
                    <ArrowRightIcon className="size-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button href="/cart" variant="outline" fullWidth onClick={closeCart}>
                      View Cart
                    </Button>
                    <Button variant="ghost" fullWidth onClick={closeCart}>
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
