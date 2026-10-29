import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";

/**
 * Prices as the checkout will charge them, in paise. They come from the
 * WooCommerce product and the Deposits setting, never from the CMS copy.
 */
export type LandingPricing = {
  productId: number;
  currency: string;
  priceMinor: number;
  mrpMinor: number;
  advanceMinor: number;
};

/** "23:59" becomes "11:59". Anything unreadable falls back to 11:59. */
export function formatEndTime(endTime: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(endTime.trim());
  const hours = match ? Number(match[1]) % 24 : 23;
  const minutes = match ? match[2] : "59";
  return `${hours % 12 || 12}:${minutes}`;
}

/** Replaces {price} {mrp} {discount} {advance} {balance} {end} in editor copy. */
export function fillTokens(text: string, pricing: LandingPricing, endTime: string): string {
  const money = (minor: number) => formatMinorUnitsToCurrency(Math.max(0, minor), pricing.currency);
  const tokens: Record<string, string> = {
    price: money(pricing.priceMinor),
    mrp: money(pricing.mrpMinor),
    discount: money(pricing.mrpMinor - pricing.priceMinor),
    advance: money(pricing.advanceMinor),
    balance: money(pricing.priceMinor - pricing.advanceMinor),
    end: formatEndTime(endTime),
  };

  return text.replace(/\{(price|mrp|discount|advance|balance|end)\}/g, (_, key: string) => tokens[key]);
}

/** Splits **bold** markers into plain and bold runs. */
export function splitBold(text: string): Array<{ text: string; bold: boolean }> {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((part) => part.text !== "");
}

/** Text without **bold** markers and {br} line breaks, for structured data. */
export function plainText(text: string): string {
  return text.replace(/\{br\}/g, " ").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
}

/** Last ten digits, for tel: and wa.me links. */
export function localPhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "").slice(-10);
}
