import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { Price } from "./price";
import { StockStatus } from "./stock-status";
import { WishlistButton } from "./wishlist-button";
import type { ProductSummary } from "@/types";

type ProductCardProps = {
  product: ProductSummary;
  priority?: boolean;
  className?: string;
};

/**
 * The whole card is one link, via a stretched overlay on the title. That keeps
 * a single tab stop and one accessible name, instead of the "image + title +
 * button all point at the same page" pattern that makes screen-reader users
 * hear every product three times.
 */
export function ProductCard({ product, priority = false, className }: ProductCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-background",
        "transition-shadow duration-200 hover:shadow-md focus-within:shadow-md",
        className,
      )}
    >
      {/*
       * Above the stretched link overlay, or the card link would swallow the
       * press. z-10 is the minimum that clears `after:inset-0` below.
       */}
      <div className="absolute top-3 right-3 z-10">
        <WishlistButton productId={product.id} productName={product.name} />
      </div>

      <div className="bg-background-subtle p-4">
        <ResponsiveImage
          media={product.image}
          aspect="square"
          fit="contain"
          priority={priority}
          sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          imageClassName="transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        {product.tagline && (
          <p className="text-xs text-muted-foreground">{product.tagline}</p>
        )}

        <h3 className="text-sm font-medium leading-snug text-foreground lg:text-base">
          <Link href="/fire-safety-kit" className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <Price
            amountMinor={product.priceMinor}
            compareAtMinor={product.regularPriceMinor}
            currency={product.currency}
          />
          <StockStatus status={product.stockStatus} />
        </div>
      </div>
    </article>
  );
}
