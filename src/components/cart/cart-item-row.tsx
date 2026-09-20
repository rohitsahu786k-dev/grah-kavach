"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import type { ValidatedLineItem } from "@/lib/cart/types";

type CartItemRowProps = {
  item: ValidatedLineItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  disabled?: boolean;
};

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  disabled = false,
}: CartItemRowProps) {
  const maxAvailable = item.stockQuantity ?? 99;

  return (
    <div className="flex flex-col gap-4 border-b border-border py-6 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      {/* Product info */}
      <div className="flex items-start gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-stone-50">
          {item.image ? (
            <Image
              src={item.image}
              alt={item.name}
              fill
              sizes="80px"
              className="object-contain p-1.5"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-stone-100 text-xs text-stone-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={item.slug ? `/fire-safety-kit` : "#"}
            className="text-base font-medium text-foreground transition-colors hover:text-primary"
          >
            {item.name}
          </Link>
          {item.sku ? (
            <p className="mt-0.5 text-xs text-muted-foreground">SKU: {item.sku}</p>
          ) : null}

          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {formatMinorUnitsToCurrency(item.unitPriceMinor, "INR")}
            </span>
            {item.regularPriceMinor && item.regularPriceMinor > item.unitPriceMinor ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatMinorUnitsToCurrency(item.regularPriceMinor, "INR")}
              </span>
            ) : null}
          </div>

          {item.error ? (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-danger">
              <svg
                className="size-3.5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {item.error}
            </div>
          ) : null}
        </div>
      </div>

      {/* Controls: Quantity & Subtotal & Remove */}
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        {/* Quantity +/- */}
        <div className="flex items-center rounded-lg border border-border bg-white shadow-xs">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            disabled={disabled || item.quantity <= 1}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <span className="w-10 text-center text-sm font-medium tabular-nums text-foreground">
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            disabled={disabled || item.quantity >= maxAvailable || item.stockStatus === "outofstock"}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>

        {/* Subtotal */}
        <div className="min-w-[80px] text-right">
          <p className="text-base font-medium text-foreground">
            {formatMinorUnitsToCurrency(item.lineSubtotalMinor, "INR")}
          </p>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="p-1.5 text-stone-400 transition-colors hover:text-danger disabled:opacity-50"
          aria-label={`Remove ${item.name} from cart`}
          title="Remove item"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
