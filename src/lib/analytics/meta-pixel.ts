/**
 * Client-side Meta Pixel helpers.
 *
 * Provides safe wrappers around `window.fbq` to track standard and custom
 * events, supporting event deduplication via `eventID` for seamless matching
 * with Meta Conversions API (CAPI).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID || "1790598735635524";

/** Safely calls window.fbq if available. */
export function fbq(...args: unknown[]): void {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    window.fbq(...args);
  }
}

/** Fires a PageView event on the Meta Pixel. */
export function pageview(): void {
  fbq("track", "PageView");
}

export type PixelEventOptions = {
  eventID?: string;
};

/**
 * Tracks a custom or standard Meta Pixel event with optional eventID deduplication.
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: PixelEventOptions,
): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  if (options?.eventID) {
    window.fbq("track", eventName, params, { eventID: options.eventID });
  } else if (params) {
    window.fbq("track", eventName, params);
  } else {
    window.fbq("track", eventName);
  }
}

/** Tracks a ViewContent event (e.g. visiting the product details page). */
export function trackViewContent(data: {
  id?: string | number;
  name?: string;
  content_name?: string;
  content_ids?: (string | number)[];
  content_type?: string;
  value?: number;
  currency?: string;
}): void {
  const contentIds =
    data.content_ids || (data.id !== undefined ? [data.id] : ["fire-safety-kit"]);
  trackMetaEvent("ViewContent", {
    content_name:
      data.content_name || data.name || "Graha Kavach Emergency Fire Safety Kit",
    content_ids: contentIds,
    content_type: data.content_type || "product",
    value: data.value ?? 2499,
    currency: data.currency || "INR",
  });
}

/** Tracks an AddToCart event. */
export function trackAddToCart(data: {
  id?: string | number;
  name?: string;
  content_name?: string;
  content_ids?: (string | number)[];
  content_type?: string;
  value?: number;
  quantity?: number;
  currency?: string;
}): void {
  const contentIds =
    data.content_ids || (data.id !== undefined ? [data.id] : ["fire-safety-kit"]);
  trackMetaEvent("AddToCart", {
    content_name:
      data.content_name || data.name || "Graha Kavach Emergency Fire Safety Kit",
    content_ids: contentIds,
    content_type: data.content_type || "product",
    value: data.value ?? 2499,
    currency: data.currency || "INR",
    ...(data.quantity ? { num_items: data.quantity } : {}),
  });
}

/** Tracks an InitiateCheckout event. */
export function trackInitiateCheckout(data: {
  value?: number;
  currency?: string;
  num_items?: number;
  content_ids?: (string | number)[];
}): void {
  trackMetaEvent("InitiateCheckout", {
    value: data.value ?? 2499,
    currency: data.currency || "INR",
    num_items: data.num_items ?? 1,
    content_ids: data.content_ids || ["fire-safety-kit"],
    content_type: "product",
  });
}

/**
 * Tracks a Purchase event.
 * Uses orderId as eventID to deduplicate with server-side Conversions API.
 */
export function trackPurchase(data: {
  orderId: string | number;
  value: number;
  currency?: string;
  num_items?: number;
  content_ids?: (string | number)[];
}): void {
  trackMetaEvent(
    "Purchase",
    {
      value: data.value,
      currency: data.currency || "INR",
      num_items: data.num_items ?? 1,
      content_ids: data.content_ids || ["fire-safety-kit"],
      content_type: "product",
    },
    { eventID: String(data.orderId) },
  );
}
