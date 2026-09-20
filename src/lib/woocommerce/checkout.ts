import { getWooCommerceUrls, wooRequest } from "./client";

export function getCheckoutUrl() {
  return getWooCommerceUrls().checkout;
}

export async function createCheckoutOrder(payload: unknown) {
  return wooRequest<unknown>({
    path: "/orders",
    method: "POST",
    body: payload,
    revalidate: false,
  });
}
