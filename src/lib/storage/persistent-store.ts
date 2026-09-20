"use client";

import { useCallback, useSyncExternalStore } from "react";

/*
 * A small localStorage/sessionStorage-backed store.
 *
 * The cart and the wishlist both need the same four things: read a value that
 * only exists in the browser, write it back, notice when another tab changes
 * it, and render something sensible during server rendering. Doing that with
 * `useState` plus a mount effect means rendering the wrong value first and
 * correcting it, which React now (rightly) flags.
 *
 * `useSyncExternalStore` is the mechanism built for exactly this: it takes a
 * server snapshot, a client snapshot and a subscription, and React handles the
 * hand-off at hydration. The snapshot must be reference-stable between changes
 * or React re-renders forever, so the parsed value is cached and the cache is
 * only invalidated on a write or a storage event.
 */

type Listener = () => void;

export type PersistentStore<T> = {
  get: () => T;
  getServerSnapshot: () => T;
  set: (next: T) => void;
  subscribe: (listener: Listener) => () => void;
};

type Options<T> = {
  key: string;
  /** Stable empty value. Used on the server and whenever parsing fails. */
  fallback: T;
  /** Validates and normalises whatever is in storage. */
  parse: (raw: string) => T | null;
  serialize?: (value: T) => string;
  session?: boolean;
};

export function createPersistentStore<T>({
  key,
  fallback,
  parse,
  serialize = JSON.stringify,
  session = false,
}: Options<T>): PersistentStore<T> {
  const listeners = new Set<Listener>();
  let cache: T | undefined;
  let attached = false;

  function storage(): Storage | null {
    try {
      return session ? window.sessionStorage : window.localStorage;
    } catch {
      // Blocked entirely by the browser (some private modes).
      return null;
    }
  }

  function emit() {
    for (const listener of listeners) listener();
  }

  function handleStorageEvent(event: StorageEvent) {
    if (event.key !== null && event.key !== key) return;
    cache = undefined; // Re-read lazily on the next snapshot.
    emit();
  }

  return {
    get() {
      if (cache !== undefined) return cache;

      const store = storage();
      if (!store) {
        cache = fallback;
        return cache;
      }

      try {
        const raw = store.getItem(key);
        cache = (raw ? parse(raw) : null) ?? fallback;
      } catch {
        cache = fallback;
      }

      return cache;
    },

    getServerSnapshot() {
      return fallback;
    },

    set(next: T) {
      cache = next;

      const store = storage();
      if (store) {
        try {
          store.setItem(key, serialize(next));
        } catch {
          // Quota exceeded or storage disabled. The value still applies for
          // this session; losing persistence is better than throwing inside a
          // click handler.
        }
      }

      emit();
    },

    subscribe(listener: Listener) {
      listeners.add(listener);

      // sessionStorage is per-tab, so cross-tab events are only relevant to
      // the localStorage-backed stores.
      if (!attached && !session && typeof window !== "undefined") {
        window.addEventListener("storage", handleStorageEvent);
        attached = true;
      }

      return () => {
        listeners.delete(listener);
        if (listeners.size === 0 && attached) {
          window.removeEventListener("storage", handleStorageEvent);
          attached = false;
        }
      };
    },
  };
}

/** Subscribes a component to a store. */
export function usePersistentStore<T>(store: PersistentStore<T>): T {
  const subscribe = useCallback((listener: Listener) => store.subscribe(listener), [store]);
  return useSyncExternalStore(subscribe, store.get, store.getServerSnapshot);
}

const noopSubscribe = () => () => {};

/**
 * False during server rendering and the hydration pass, true afterwards.
 *
 * Lets a badge hold back its count until the stored value is known, without an
 * effect and without ever rendering a number that then changes.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
