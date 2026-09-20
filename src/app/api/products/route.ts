import { NextResponse } from "next/server";
import { wooProductToSummary } from "@/lib/woocommerce/adapters";
import { wooRequest } from "@/lib/woocommerce/client";
import { wooProductSchema, type WooProduct } from "@/lib/woocommerce/types";
import { z } from "zod";

export const dynamic = "force-dynamic";

const productsSchema = z.array(wooProductSchema);

/**
 * Product summaries by id: `/api/products?ids=32,41`.
 *
 * The wishlist holds identifiers only, and it lives in browser storage, so the
 * page that renders it has to ask the server what those identifiers currently
 * mean. Going through WooCommerce on every request is the point — a saved item
 * must show today's price and today's stock, not what was true when it was
 * saved.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("ids") ?? "";

  const ids = Array.from(
    new Set(
      raw
        .split(",")
        .map((part) => Number.parseInt(part.trim(), 10))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ).slice(0, 100);

  if (ids.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await wooRequest<WooProduct[]>({
      path: "/products",
      query: { include: ids.join(","), per_page: ids.length, status: "publish" },
      schema: productsSchema,
      revalidate: false,
    });

    // Preserve the order the caller asked for; WooCommerce sorts by date.
    const byId = new Map(products.map((product) => [product.id, product]));
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((product): product is WooProduct => Boolean(product));

    return NextResponse.json({
      products: ordered.map((product) => ({
        ...wooProductToSummary(product),
        stockQuantity: product.stock_quantity ?? null,
        shortDescription: product.short_description ?? "",
      })),
    });
  } catch {
    return NextResponse.json({ products: [], error: "Could not load products." }, { status: 502 });
  }
}
