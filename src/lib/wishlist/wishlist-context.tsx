"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useCustomer } from "@/lib/auth/use-customer";
import {
  createPersistentStore,
  useHydrated,
  usePersistentStore,
} from "@/lib/storage/persistent-store";
import type { WishlistContextType, WishlistEntry, WishlistSyncState } from "./types";

/*
 * Wishlist state for the whole app.
 *
 * Guests get browser storage. Signed-in customers get the same list persisted
 * to their WooCommerce customer record, so it follows them to another device.
 * Local state is always what the screen renders and the server write happens
 * behind it, because a heart that waits for a round trip before filling in
 * feels broken on a slow connection.
 *
 * Only product identifiers are stored. No name, price or personal detail ever
 * goes into browser storage.
 */

const EMPTY: WishlistEntry[] = [];

/** Newest first, one entry per product. */
function normalize(entries: WishlistEntry[]): WishlistEntry[] {
  const byId = new Map<number, WishlistEntry>();
  for (const entry of entries) {
    const existing = byId.get(entry.productId);
    if (!existing || existing.addedAt < entry.addedAt) byId.set(entry.productId, entry);
  }
  return Array.from(byId.values()).sort((a, b) => b.addedAt - a.addedAt);
}

const wishlistStore = createPersistentStore<WishlistEntry[]>({
  key: "gk_wishlist_v1",
  fallback: EMPTY,
  parse(raw) {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return normalize(
      parsed.flatMap((entry): WishlistEntry[] => {
        // Tolerates an older format that stored bare ids.
        if (typeof entry === "number" && Number.isInteger(entry) && entry > 0) {
          return [{ productId: entry, addedAt: Date.now() }];
        }
        if (entry && typeof entry === "object" && "productId" in entry) {
          const candidate = entry as { productId: unknown; addedAt?: unknown };
          const productId = Number(candidate.productId);
          if (!Number.isInteger(productId) || productId <= 0) return [];
          return [
            {
              productId,
              addedAt: typeof candidate.addedAt === "number" ? candidate.addedAt : Date.now(),
            },
          ];
        }
        return [];
      }),
    );
  },
});

function toEntries(productIds: number[], previous: WishlistEntry[]): WishlistEntry[] {
  const known = new Map(previous.map((entry) => [entry.productId, entry.addedAt]));
  // Stored order is oldest-first; synthesise timestamps that preserve it for
  // ids this browser has never seen.
  return normalize(
    productIds.map((productId, index) => ({
      productId,
      addedAt: known.get(productId) ?? index + 1,
    })),
  );
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { customer, isLoading: customerLoading } = useCustomer();
  const entries = usePersistentStore(wishlistStore);
  const isReady = useHydrated();
  const [syncState, setSyncState] = useState<WishlistSyncState>("idle");

  const customerId = customer?.customerId ?? null;
  const syncedCustomerId = useRef<number | null>(null);

  /*
   * True while the sign-in merge is in flight.
   *
   * Nothing may be written during that window. The merge is a read-modify-
   * write on the server, and a plain save racing it carries only this
   * browser's list — if that landed second it would overwrite the merged
   * result and silently delete items saved on another device.
   *
   * A ref rather than state on purpose: it must not be an effect dependency.
   * The save effect sets `syncState`, so depending on sync state here would
   * re-arm the effect from its own output and save in a loop.
   */
  const mergeInFlight = useRef(false);

  /*
   * Sign-in: merge, then adopt. The guest list is only replaced once the
   * server confirms it holds the union, so a failed merge loses nothing.
   */
  useEffect(() => {
    if (!isReady || customerLoading) return;

    if (customerId === null) {
      // Signed out. Drop the local copy so the next person using this browser
      // does not inherit the previous customer's saved items. No save can fire
      // from this, because the save effect returns early without a customer.
      if (syncedCustomerId.current !== null) {
        syncedCustomerId.current = null;
        wishlistStore.set(EMPTY);
      }
      return;
    }

    if (syncedCustomerId.current === customerId) return;
    syncedCustomerId.current = customerId;

    let cancelled = false;
    const guestEntries = wishlistStore.get();
    mergeInFlight.current = true;
    setSyncState("loading");

    fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds: guestEntries.map((entry) => entry.productId) }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("merge failed");
        return (await response.json()) as { productIds?: number[] };
      })
      .then((data) => {
        if (cancelled) return;

        /*
         * Union with whatever is in the store *now*, not with the list
         * captured when the request went out: anything saved while the merge
         * was in flight must survive it. The store write that follows re-arms
         * the save effect, which persists that union — so a toggle made during
         * sign-in is not lost.
         */
        const current = wishlistStore.get();
        const unionIds = Array.from(
          new Set([...(data.productIds ?? []), ...current.map((entry) => entry.productId)]),
        );

        mergeInFlight.current = false;
        wishlistStore.set(toEntries(unionIds, current));
        setSyncState("idle");
      })
      .catch(() => {
        if (cancelled) return;
        // The local list is untouched, and a reload or the next sign-in
        // retries the merge.
        mergeInFlight.current = false;
        syncedCustomerId.current = null;
        setSyncState("error");
      });

    return () => {
      cancelled = true;
      mergeInFlight.current = false;
    };
  }, [isReady, customerLoading, customerId]);

  /* Signed-in changes are written through, debounced so a burst of clicks is one request. */
  useEffect(() => {
    if (!isReady || customerId === null) return;

    // Never write while the merge is still in flight: that request is the one
    // that knows about both lists. It re-writes the store when it finishes,
    // which brings this effect straight back.
    if (mergeInFlight.current) return;

    const timer = window.setTimeout(() => {
      // Read at send time rather than from the closure, so the request always
      // carries the current list even if something changed during the debounce.
      const productIds = wishlistStore.get().map((entry) => entry.productId);

      setSyncState("saving");
      fetch("/api/wishlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      })
        .then((response) => setSyncState(response.ok ? "idle" : "error"))
        .catch(() => setSyncState("error"));
    }, 600);

    return () => window.clearTimeout(timer);
  }, [entries, isReady, customerId]);

  const has = useCallback(
    (productId: number) => entries.some((entry) => entry.productId === productId),
    [entries],
  );

  const add = useCallback((productId: number) => {
    const current = wishlistStore.get();
    if (current.some((entry) => entry.productId === productId)) return;
    wishlistStore.set(normalize([{ productId, addedAt: Date.now() }, ...current]));
  }, []);

  const remove = useCallback((productId: number) => {
    const current = wishlistStore.get();
    const next = current.filter((entry) => entry.productId !== productId);
    if (next.length !== current.length) wishlistStore.set(next);
  }, []);

  /** Returns the state the product is in *after* the toggle. */
  const toggle = useCallback(
    (productId: number) => {
      const saved = wishlistStore.get().some((entry) => entry.productId === productId);
      if (saved) {
        remove(productId);
      } else {
        add(productId);
      }
      return !saved;
    },
    [add, remove],
  );

  const clear = useCallback(() => wishlistStore.set(EMPTY), []);

  const value = useMemo<WishlistContextType>(
    () => ({
      entries,
      productIds: entries.map((entry) => entry.productId),
      count: entries.length,
      isReady,
      syncState,
      has,
      add,
      remove,
      toggle,
      clear,
    }),
    [entries, isReady, syncState, has, add, remove, toggle, clear],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a <WishlistProvider>.");
  }
  return context;
}
