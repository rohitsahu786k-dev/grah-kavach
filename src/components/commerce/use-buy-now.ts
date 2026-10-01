"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { payWithRazorpay } from "@/lib/razorpay/client";
import { useCart } from "@/lib/cart/cart-context";

export function useBuyNow(productId: number, productName: string) {
  const router = useRouter();
  const { addItem } = useCart();
  const [isBuying, setIsBuying] = useState(false);

  async function handleBuyNow(quantity = 1) {
    if (isBuying) return;
    setIsBuying(true);

    try {
      const res = await fetch("/api/checkout/buy-now", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok || !data.success || !data.razorpay) {
        throw new Error(data.error || "Failed to initialize payment gateway.");
      }

      const result = await payWithRazorpay({
        keyId: data.razorpay.keyId,
        orderId: data.razorpay.orderId,
        amount: data.razorpay.amount,
        currency: data.razorpay.currency,
        name: "Graha Kavach",
        description: `${data.productName || productName} (Qty: ${quantity})`,
        one_click_checkout: true,
      });

      if (result.status === "paid") {
        await fetch("/api/checkout/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            wooOrderId: data.orderId,
            orderKey: data.orderKey,
            ...result.payment,
          }),
        }).catch((err) => console.error("Verify call error:", err));

        router.push(`/order-confirmation?orderId=${data.orderId}&key=${data.orderKey}`);
        return;
      }

      if (result.status === "failed") {
        alert(result.message || "Payment could not be completed. Please try again.");
      }
    } catch (err) {
      console.error("Direct Razorpay checkout error, redirecting to checkout page:", err);
      // Seamless fallback: add item to cart and navigate to checkout page
      addItem(productId, quantity);
      router.push("/checkout");
    } finally {
      setIsBuying(false);
    }
  }

  return { handleBuyNow, isBuying };
}
