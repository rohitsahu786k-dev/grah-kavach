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

const FALLBACK_PRIMARY_PRODUCT: WooProduct = {
  id: 1,
  name: "Graha Kavach 3-in-1 Home Fire Safety Kit",
  slug: "fire-safety-kit",
  permalink: "https://grahakavach.in/fire-safety-kit",
  type: "simple",
  status: "publish",
  sku: "GK-KIT-01",
  price: "2499",
  regular_price: "3499",
  sale_price: "2499",
  stock_status: "instock",
  stock_quantity: 50,
  average_rating: "4.9",
  rating_count: 128,
  short_description: "Complete 3-in-1 home fire safety kit engineered by Speciality Geochem, Udaipur.",
  description: "Complete 3-in-1 home fire safety kit engineered by Speciality Geochem, Udaipur.",
  images: [
    {
      id: 1,
      src: "https://admin.grahakavach.in/wp-content/uploads/graha-kavach-01-extinguish-21x6-1.webp",
      name: "Graha Kavach 3-in-1 Fire Safety Kit",
      alt: "Graha Kavach 3-in-1 Fire Safety Kit",
    },
  ],
  categories: [{ id: 1, name: "Fire Safety", slug: "fire-safety" }],
};

export async function getPrimaryProduct() {
  try {
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
      return FALLBACK_PRIMARY_PRODUCT;
    }

    return product;
  } catch (error) {
    console.error("Failed to fetch primary product from WooCommerce, using fallback:", error);
    return FALLBACK_PRIMARY_PRODUCT;
  }
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
