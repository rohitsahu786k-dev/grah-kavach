/**
 * A wishlist entry is deliberately just an identifier and a timestamp.
 *
 * Names, prices and stock are never stored: they go stale, and a saved price
 * shown next to a different live price is worse than no price. Everything
 * displayable is read back from WooCommerce when the list is rendered.
 */
export type WishlistEntry = {
  productId: number;
  addedAt: number;
};

export type WishlistSyncState = "idle" | "loading" | "saving" | "error";

export type WishlistContextType = {
  entries: WishlistEntry[];
  productIds: number[];
  count: number;
  /** False until browser storage has been read, so the UI can avoid a flash of "0". */
  isReady: boolean;
  syncState: WishlistSyncState;
  has: (productId: number) => boolean;
  add: (productId: number) => void;
  remove: (productId: number) => void;
  toggle: (productId: number) => boolean;
  clear: () => void;
};
