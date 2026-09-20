import { z } from "zod";
import { wooRequest } from "./client";
import { wooCouponSchema, type WooCoupon } from "./types";

export async function getCouponByCode(code: string) {
  const coupons = await wooRequest<WooCoupon[]>({
    path: "/coupons",
    query: { code },
    schema: z.array(wooCouponSchema),
    revalidate: false,
  });

  return coupons[0] ?? null;
}
