import { z } from "zod";
import { wooRequest } from "./client";
import { wooCustomerSchema, type WooCustomer } from "./types";

export async function getCustomer(customerId: number) {
  return wooRequest<WooCustomer>({
    path: `/customers/${customerId}`,
    schema: wooCustomerSchema,
    revalidate: false,
  });
}

export async function getCustomersByEmail(email: string) {
  return wooRequest<WooCustomer[]>({
    path: "/customers",
    query: { email },
    schema: z.array(wooCustomerSchema),
    revalidate: false,
  });
}
