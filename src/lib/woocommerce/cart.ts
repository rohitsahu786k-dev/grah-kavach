import { wooRequest } from "./client";

export async function createWooCartSession() {
  return wooRequest<unknown>({
    path: "/cart",
    method: "GET",
    revalidate: false,
  });
}
