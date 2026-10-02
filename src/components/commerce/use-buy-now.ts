"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart/cart-context";

/** Buy Now: put the item in the cart and go to the checkout page. */
export function useBuyNow(productId: number) {
  const router = useRouter();
  const { addItem } = useCart();

  function handleBuyNow(quantity = 1) {
    addItem(productId, quantity);
    router.push("/checkout");
  }

  return { handleBuyNow };
}
