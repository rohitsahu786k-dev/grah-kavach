import type { ProductSummary } from "@/types";
import type { WooProduct } from "./types";

export function decimalToMinorUnits(value: string): number | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function minorUnitsToNumber(value: number | null): number | undefined {
  return typeof value === "number" ? value / 100 : undefined;
}

export function wooProductToSummary(product: WooProduct): ProductSummary {
  const image = product.images[0];

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceMinor: decimalToMinorUnits(product.price),
    regularPriceMinor: decimalToMinorUnits(product.regular_price),
    currency: "INR",
    stockStatus: product.stock_status,
    image: image
      ? {
          id: image.id,
          url: image.src,
          alt: image.alt || image.name || product.name,
          width: null,
          height: null,
        }
      : null,
    tagline: product.short_description.replace(/<[^>]*>/g, "").trim(),
  };
}

export function wooProductGallery(product: WooProduct) {
  return product.images.map((image) => ({
    id: image.id,
    url: image.src,
    alt: image.alt || image.name || product.name,
    width: null,
    height: null,
  }));
}

/**
 * Formats an amount held in minor units for display.
 *
 * Kept next to `decimalToMinorUnits` deliberately: parsing and formatting money
 * are two halves of one contract, and a second formatter defined elsewhere is
 * how a site ends up showing "Rs.2499" in one place and "₹2,499" in another.
 */
export function formatMinorUnitsToCurrency(
  amountMinor: number | null | undefined,
  currency = "INR",
  locale = "en-IN",
): string {
  if (typeof amountMinor !== "number" || Number.isNaN(amountMinor)) return "—";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(amountMinor / 100);
}
