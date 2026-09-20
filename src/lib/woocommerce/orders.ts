import { z } from "zod";
import { wooRequest } from "./client";
import { wooOrderSchema, type WooOrder } from "./types";

export async function getOrder(orderId: number) {
  return wooRequest<WooOrder>({
    path: `/orders/${orderId}`,
    schema: wooOrderSchema,
    revalidate: false,
  });
}

export async function getOrders(query: { customer?: number; status?: string } = {}) {
  return wooRequest<WooOrder[]>({
    path: "/orders",
    query,
    schema: z.array(wooOrderSchema),
    revalidate: false,
  });
}
