declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Asks the server whether this order is a verified online payment that has not
 * been reported yet, and only then pushes the GTM `purchase` event. The values
 * come from the WooCommerce order, never from the page.
 */
export async function reportVerifiedPurchase(orderId: number, key: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch("/api/analytics/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, key }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { fire?: boolean; transaction_id?: string; value?: number; currency?: string };
    if (!data.fire || !data.transaction_id || typeof data.value !== "number") return;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "purchase",
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency || "INR",
    });
  } catch {
    // Tracking must never get in the way of the order page.
  }
}
