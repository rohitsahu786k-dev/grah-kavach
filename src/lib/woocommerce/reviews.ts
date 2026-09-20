import { z } from "zod";
import { CacheTag, Revalidate } from "@/lib/cache";
import { wooRequest } from "./client";
import { wooReviewSchema, type WooReview } from "./types";

export async function getProductReviews(productId: number) {
  return wooRequest<WooReview[]>({
    path: "/products/reviews",
    query: { product: productId },
    schema: z.array(wooReviewSchema),
    tags: [CacheTag.product(productId)],
    revalidate: Revalidate.catalogue,
  });
}
