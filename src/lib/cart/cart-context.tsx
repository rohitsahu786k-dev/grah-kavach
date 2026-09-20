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
import {
  createPersistentStore,
  useHydrated,
  usePersistentStore,
} from "@/lib/storage/persistent-store";
import type { CartContextType, CartItem } from "./types";

/*
 * The cart holds identifiers and quantities only.
 *
 * Prices, names and stock are never written to browser storage: they are read
 * back from WooCommerce through /api/cart/validate every time the cart is
 * shown. A price cached in localStorage is a price that can disagree with the
 * one the customer is actually charged, which is the one cart bug that is
 * genuinely expensive to have.
 *
 * Both stores are module-level, so every tab and every component sees the same
 * value and cross-tab writes arrive through the storage event.
 */

const EMPTY_ITEMS: CartItem[] = [];

const cartStore = createPersistentStore<CartItem[]>({
  key: "gk_cart_v1",
  fallback: EMPTY_ITEMS,
  parse(raw) {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;

    return parsed.filter(
      (item): item is CartItem =>
        Boolean(item) &&
        typeof item === "object" &&
        Number.isInteger((item as CartItem).productId) &&
        (item as CartItem).productId > 0 &&
        Number.isInteger((item as CartItem).quantity) &&
        (item as CartItem).quantity > 0,
    );
  },
});

const couponStore = createPersistentStore<string>({
  key: "gk_cart_coupon_v1",
  fallback: "",
  parse: (raw) => raw,
  serialize: (value) => value,
  session: true,
});

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const items = usePersistentStore(cartStore);
  const couponCode = usePersistentStore(couponStore);
  const isReady = useHydrated();

  /*
   * The product most recently added, used for the brief highlight on its row
   * in the drawer. It is context state rather than a prop so that every entry
   * point — product section, wishlist page, mobile bar — gets the same
   * feedback without threading a flag through each of them.
   */
  const [lastAddedProductId, setLastAddedProductId] = useState<number | null>(null);
  const highlightTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    },
    [],
  );

  const removeItem = useCallback((productId: number) => {
    const current = cartStore.get();
    const next = current.filter((item) => item.productId !== productId);
    if (next.length !== current.length) cartStore.set(next);
  }, []);

  const addItem = useCallback((productId: number, quantity = 1) => {
    const amount = Math.max(1, Math.floor(quantity));
    const current = cartStore.get();
    const index = current.findIndex((item) => item.productId === productId);

    cartStore.set(
      index > -1
        ? current.map((item, i) =>
            i === index ? { ...item, quantity: item.quantity + amount } : item,
          )
        : [...current, { productId, quantity: amount }],
    );

    setLastAddedProductId(productId);
    if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
    highlightTimer.current = window.setTimeout(() => setLastAddedProductId(null), 2500);
  }, []);

  const updateQuantity = useCallback(
    (productId: number, quantity: number) => {
      const amount = Math.floor(quantity);

      if (amount <= 0) {
        removeItem(productId);
        return;
      }

      cartStore.set(
        cartStore
          .get()
          .map((item) => (item.productId === productId ? { ...item, quantity: amount } : item)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    cartStore.set(EMPTY_ITEMS);
    couponStore.set("");
  }, []);

  const setCouponCode = useCallback((code: string) => couponStore.set(code.trim()), []);

  const totalItemCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextType>(
    () => ({
      items,
      totalItemCount,
      isReady,
      lastAddedProductId,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      couponCode,
      setCouponCode,
    }),
    [
      items,
      totalItemCount,
      isReady,
      lastAddedProductId,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      couponCode,
      setCouponCode,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
