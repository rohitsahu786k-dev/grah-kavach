import "server-only";

import { z } from "zod";
import { wooRequest } from "@/lib/woocommerce/client";

/*
 * The signed-in wishlist lives in WooCommerce customer meta.
 *
 * This was chosen over installing a wishlist plugin. Every maintained
 * WooCommerce wishlist plugin we looked at renders through shortcodes and
 * enqueues its own frontend CSS/JS, exposes its state through admin-ajax
 * rather than a documented REST resource, and keys entries to a WordPress
 * session cookie that a separate Next.js origin never sends. None of that
 * survives a headless frontend. Customer meta is a first-class field of the
 * existing WooCommerce REST API, needs no extra plugin, and travels with the
 * customer record on export or migration.
 *
 * The meta key is non-protected (no leading underscore) so it is readable and
 * writable through /wc/v3/customers without extra server code.
 */

const META_KEY = "gk_wishlist";

const metaCustomerSchema = z.object({
  id: z.number(),
  meta_data: z
    .array(
      z.object({
        id: z.number().optional(),
        key: z.string(),
        value: z.unknown(),
      }),
    )
    .optional()
    .default([]),
});

/** Accepts the several shapes WordPress meta can come back as. */
function coerceIds(value: unknown): number[] {
  const raw: unknown[] = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim().startsWith("[")
      ? safeJsonArray(value)
      : typeof value === "string" && value.trim()
        ? value.split(",")
        : [];

  const ids = raw
    .map((entry) => {
      if (typeof entry === "number") return entry;
      if (typeof entry === "string") return Number.parseInt(entry, 10);
      if (entry && typeof entry === "object" && "productId" in entry) {
        return Number((entry as { productId: unknown }).productId);
      }
      return Number.NaN;
    })
    .filter((id) => Number.isInteger(id) && id > 0);

  return Array.from(new Set(ids));
}

function safeJsonArray(value: string): unknown[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function readCustomerWishlist(customerId: number): Promise<number[]> {
  const customer = await wooRequest<z.infer<typeof metaCustomerSchema>>({
    path: `/customers/${customerId}`,
    schema: metaCustomerSchema,
    revalidate: false,
  });

  const entry = customer.meta_data.find((meta) => meta.key === META_KEY);
  return entry ? coerceIds(entry.value) : [];
}

export async function writeCustomerWishlist(
  customerId: number,
  productIds: number[],
): Promise<number[]> {
  // Cap the stored list. An unbounded array in a meta row is a slow read for
  // everyone and a wishlist that large is never used as one.
  const ids = Array.from(new Set(productIds.filter((id) => Number.isInteger(id) && id > 0))).slice(
    0,
    200,
  );

  await wooRequest({
    path: `/customers/${customerId}`,
    method: "PUT",
    body: { meta_data: [{ key: META_KEY, value: ids }] },
    revalidate: false,
  });

  return ids;
}

/**
 * Union of the guest list and the stored list, guest entries first.
 *
 * Merge never removes: signing in on a second device must not delete what was
 * saved on the first, and there is no way to tell an intentional removal from
 * a device that simply never had the item.
 */
export function mergeWishlists(guestIds: number[], serverIds: number[]): number[] {
  return Array.from(new Set([...serverIds, ...guestIds]));
}
