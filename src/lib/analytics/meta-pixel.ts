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

/** Fires a PageView event (browser Pixel + server Conversions API). */
export function pageview(): void {
  trackMetaEvent("PageView");
}

export type PixelEventOptions = {
  eventID?: string;
};

function newEventId(eventName: string): string {
  const rand =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  return `${eventName}-${rand}`;
}

/**
 * Sends the same event to the server-side Conversions API. Meta merges it with
 * the browser event through the shared event id, so a visit is still counted
 * when the browser Pixel is blocked or dropped.
 */
function sendServerEvent(
  eventName: string,
  eventId: string,
  params?: Record<string, unknown>,
): void {
  try {
    void fetch("/api/analytics/meta-capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        eventName,
        eventId,
        eventSourceUrl: window.location.href,
        customData: params,
      }),
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}

/**
 * Tracks a standard or custom event in the browser Pixel and on the server.
 * A shared eventID is generated when none is given, for deduplication.
 */
export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  options?: PixelEventOptions,
): void {
  if (typeof window === "undefined") return;

  const eventID = options?.eventID || newEventId(eventName);

  if (typeof window.fbq === "function") {
    window.fbq("track", eventName, params ?? {}, { eventID });
  }
  // Purchase is already sent server-side by the checkout routes.
  if (eventName !== "Purchase") sendServerEvent(eventName, eventID, params);
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
  /** Price of one unit in paise; with `quantity` it gives the event value. */
  unitPriceMinor?: number;
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
    value:
      data.value ??
      (typeof data.unitPriceMinor === "number"
        ? (data.unitPriceMinor * (data.quantity ?? 1)) / 100
        : 2499 * (data.quantity ?? 1)),
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
