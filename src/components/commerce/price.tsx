import { cn } from "@/lib/utils/cn";

type PriceProps = {
  /** Amount in the currency's smallest unit (paise for INR). */
  amountMinor: number | null;
  /** Original price, when the item is discounted. */
  compareAtMinor?: number | null;
  currency?: string;
  locale?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl lg:text-2xl",
} as const;

/**
 * Money is held in minor units throughout, because floats cannot represent
 * decimal currency exactly and rounding drift turns into real money.
 * Formatting is delegated to Intl so INR gets correct grouping (1,00,000).
 */
export function Price({
  amountMinor,
  compareAtMinor,
  currency = "INR",
  locale = "en-IN",
  size = "md",
  className,
}: PriceProps) {
  if (amountMinor === null) {
    return (
      <span className={cn("text-muted-foreground", sizes[size], className)}>
        Price on request
      </span>
    );
  }

  const format = (minor: number) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
    }).format(minor / 100);

  const onSale = typeof compareAtMinor === "number" && compareAtMinor > amountMinor;

  return (
    <span className={cn("inline-flex items-baseline gap-2", sizes[size], className)}>
      <span className="font-medium text-foreground">{format(amountMinor)}</span>
      {onSale && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            {format(compareAtMinor)}
          </span>
          <span className="sr-only">
            reduced from {format(compareAtMinor)}
          </span>
        </>
      )}
    </span>
  );
}
