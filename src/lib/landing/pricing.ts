import "server-only";

import { computeAdvanceMinor } from "@/lib/config/checkout";
import { getCodAdvanceConfig } from "@/lib/woocommerce/checkout-settings";
import { getProductBySlug } from "@/lib/woocommerce/products";
import type { LandingPricing } from "./text";

const PRODUCT_SLUG = "fire-safety-kit";

const toMinor = (value: string) => Math.round((parseFloat(value) || 0) * 100);

/** Live price, regular price and advance for the kit. Null when the product cannot be read. */
export async function getLandingPricing(): Promise<LandingPricing | null> {
  try {
    const [product, advanceConfig] = await Promise.all([getProductBySlug(PRODUCT_SLUG), getCodAdvanceConfig()]);

    const priceMinor = toMinor(product.price);
    if (priceMinor <= 0) return null;

    const mrpMinor = Math.max(toMinor(product.regular_price), priceMinor);

    return {
      productId: product.id,
      currency: "INR",
      priceMinor,
      mrpMinor,
      advanceMinor: computeAdvanceMinor(advanceConfig, priceMinor),
    };
  } catch (error) {
    console.warn("Failed to load landing page pricing:", error);
    return null;
  }
}
