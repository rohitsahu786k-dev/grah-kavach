export type TrackingEvent =
  | { name: "view_item_list"; itemCount: number }
  | { name: "view_item"; itemId: number; itemName: string }
  | { name: "select_native_woocommerce_route"; route: "cart" | "checkout" | "account" };

export function createTrackingPayload(event: TrackingEvent) {
  return {
    ...event,
    timestamp: new Date().toISOString(),
  };
}
