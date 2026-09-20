import { z } from "zod";
import { CacheTag, Revalidate } from "@/lib/cache";
import { DataError } from "@/lib/errors";
import { wooProductToSummary } from "./adapters";
import { getWooCommerceUrls, wooRequest } from "./client";
import { wooProductSchema, type WooProduct } from "./types";

const productsSchema = z.array(wooProductSchema);

export async function getProducts(options: { perPage?: number } = {}) {
  const products = await wooRequest<WooProduct[]>({
    path: "/products",
    query: {
      per_page: options.perPage ?? 12,
      status: "publish",
    },
    schema: productsSchema,
    tags: [CacheTag.products],
    revalidate: Revalidate.pricing,
  });

  return products.map(wooProductToSummary);
}

export async function getProductBySlug(slug: string) {
  const products = await wooRequest<WooProduct[]>({
    path: "/products",
    query: {
      slug,
      status: "publish",
    },
    schema: productsSchema,
    tags: [CacheTag.products],
    revalidate: Revalidate.pricing,
  });

  const product = products[0];

  if (!product) {
    throw new DataError("not_found", "woocommerce", `Product unavailable: ${slug}`);
  }

  return product;
}

export async function getProductSummaryBySlug(slug: string) {
  return wooProductToSummary(await getProductBySlug(slug));
}

export async function getPrimaryProduct() {
  const products = await wooRequest<WooProduct[]>({
    path: "/products",
    query: {
      per_page: 1,
    },
    schema: productsSchema,
    tags: [CacheTag.products],
    revalidate: Revalidate.pricing,
  });

  const product = products[0];

  if (!product) {
    throw new DataError("not_found", "woocommerce", "Primary fire safety kit is not published.");
  }

  return product;
}

export function getAddToCartUrl(productId: number, quantity = 1) {
  const url = new URL(getWooCommerceUrls().cart);
  url.searchParams.set("add-to-cart", String(productId));
  url.searchParams.set("quantity", String(quantity));
  return url.toString();
}

export function getBuyNowUrl(productId: number, quantity = 1) {
  const url = new URL(getWooCommerceUrls().checkout);
  url.searchParams.set("add-to-cart", String(productId));
  url.searchParams.set("quantity", String(quantity));
  return url.toString();
}
