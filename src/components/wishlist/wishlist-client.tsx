"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AddToCartButton } from "@/components/commerce/add-to-cart-button";
import { Button } from "@/components/ui/button";
import { HeartIcon, SpinnerIcon, TrashIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useCustomer } from "@/lib/auth/use-customer";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import { cn } from "@/lib/utils/cn";

/*
 * The saved-items page.
 *
 * The list itself is identifiers in browser storage (and, for signed-in
 * customers, on their WooCommerce record). Everything shown — name, price,
 * sale price, stock — is fetched fresh, so a kit that has since gone on sale
 * or out of stock says so here.
 *
 * Adding to the cart deliberately leaves the item saved. Silently emptying
 * someone's wishlist because they bought something is a surprise, and undoing
 * it is impossible.
 */

type WishlistProduct = {
  id: number;
  name: string;
  slug: string;
  priceMinor: number | null;
  regularPriceMinor: number | null;
  currency: string;
  stockStatus: "instock" | "outofstock" | "onbackorder";
  stockQuantity: number | null;
  image: { url: string; alt: string } | null;
  tagline: string;
};

function StockLine({ status, quantity }: { status: WishlistProduct["stockStatus"]; quantity: number | null }) {
  if (status === "outofstock") {
    return <p className="text-sm text-danger">Out of stock</p>;
  }

  if (status === "onbackorder") {
    return <p className="text-sm text-warning">Available on backorder</p>;
  }

  return (
    <p className="text-sm text-success">
      In stock{typeof quantity === "number" ? ` · ${quantity} available` : ""}
    </p>
  );
}

function EmptyWishlist() {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius)] border border-dashed border-border bg-background-subtle px-6 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-primary-subtle text-primary">
        <HeartIcon className="size-7" />
      </div>
      <h2 className="mt-5 text-xl font-medium text-foreground">Your wishlist is empty.</h2>
      <p className="mt-2 max-w-sm leading-7 text-foreground-muted">
        Save the products you want to come back to and they will be waiting here.
      </p>
      <Button href="/fire-safety-kit" size="lg" className="mt-6">
        Explore Graha Kavach
      </Button>
    </div>
  );
}

export function WishlistClient() {
  const { productIds, count, isReady, remove, syncState } = useWishlist();
  const { customer } = useCustomer();
  const { notify } = useToast();

  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Compared by value: the array identity changes on every provider render.
  const key = productIds.join(",");

  /*
   * "Loading" is derived rather than stored: it is simply the state of having
   * asked for a set of ids the loaded products do not cover yet. One less
   * piece of state to get out of step with the request it describes.
   */
  const loading = isReady && Boolean(key) && loadedKey !== key && !error;

  useEffect(() => {
    // With nothing saved there is nothing to look up; the empty state below is
    // driven by `count`, so no state needs clearing here.
    if (!isReady || !key) return;

    let cancelled = false;

    fetch(`/api/products?ids=${key}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("load failed");
        return (await response.json()) as { products: WishlistProduct[] };
      })
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products ?? []);
        setLoadedKey(key);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError("We could not load your saved items. Please refresh to try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [key, isReady]);

  if (!isReady) {
    return (
      <div className="grid gap-4" aria-busy="true">
        {[0, 1].map((index) => (
          <div key={index} className="h-40 animate-pulse rounded-[var(--radius)] bg-muted" />
        ))}
      </div>
    );
  }

  if (count === 0) return <EmptyWishlist />;

  // Ids that no longer resolve to a published product.
  const unavailableCount = count - products.length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5">
        <p className="text-sm text-foreground-muted">
          {count} {count === 1 ? "item" : "items"} saved
          {customer ? " · synced to your account" : " · saved on this device"}
        </p>
        {syncState === "error" ? (
          <p role="alert" className="text-sm text-danger">
            Could not sync to your account. Your list is safe on this device.
          </p>
        ) : loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <SpinnerIcon className="size-4" />
            Updating
          </span>
        ) : null}
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-5 rounded-[var(--radius)] bg-danger-subtle px-4 py-3 text-sm text-danger"
        >
          {error}
        </p>
      ) : null}

      <ul className="grid gap-4">
        {products.map((product) => {
          const onSale =
            typeof product.regularPriceMinor === "number" &&
            typeof product.priceMinor === "number" &&
            product.regularPriceMinor > product.priceMinor;

          return (
            <li
              key={product.id}
              className={cn(
                "grid gap-4 rounded-[var(--radius)] border border-border bg-white p-4",
                "sm:grid-cols-[136px_1fr_auto] sm:items-center sm:gap-6 sm:p-5",
              )}
            >
              <Link
                href="/fire-safety-kit"
                className="relative block aspect-square w-full overflow-hidden rounded-[var(--radius)] border border-border bg-background-subtle sm:size-[136px]"
              >
                {product.image?.url ? (
                  <Image
                    src={product.image.url}
                    alt={product.image.alt || product.name}
                    fill
                    sizes="(max-width: 639px) 90vw, 136px"
                    className="object-contain p-2"
                  />
                ) : null}
              </Link>

              <div className="min-w-0">
                <h2 className="text-base leading-6 font-medium text-foreground">
                  <Link href="/fire-safety-kit" className="hover:text-primary">
                    {product.name}
                  </Link>
                </h2>

                {product.tagline ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-6 text-foreground-muted">
                    {product.tagline}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-wrap items-baseline gap-2">
                  <span className="text-lg font-medium text-foreground">
                    {formatMinorUnitsToCurrency(product.priceMinor, product.currency)}
                  </span>
                  {onSale ? (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatMinorUnitsToCurrency(product.regularPriceMinor, product.currency)}
                    </span>
                  ) : null}
                </div>

                <div className="mt-1.5">
                  <StockLine status={product.stockStatus} quantity={product.stockQuantity} />
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:w-44">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  disabled={product.stockStatus === "outofstock"}
                  fullWidth
                />
                <button
                  type="button"
                  onClick={() => {
                    remove(product.id);
                    notify(`Removed ${product.name} from your wishlist.`);
                  }}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-danger"
                >
                  <TrashIcon className="size-4" />
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {unavailableCount > 0 && !loading ? (
        <p className="mt-5 rounded-[var(--radius)] bg-warning-subtle px-4 py-3 text-sm leading-6 text-warning">
          {unavailableCount} saved {unavailableCount === 1 ? "item is" : "items are"} no longer
          available in the store and {unavailableCount === 1 ? "is" : "are"} not shown.
        </p>
      ) : null}
    </div>
  );
}
