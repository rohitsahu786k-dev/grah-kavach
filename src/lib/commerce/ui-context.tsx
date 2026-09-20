"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

/*
 * One place owns "is a commerce overlay open".
 *
 * The cart drawer is opened from the header, the mobile tab bar, the product
 * section, the wishlist page and the add-to-cart button. If each of those held
 * its own boolean, two of them could be open at once and the body scroll lock
 * would be applied twice and released once. A single provider also means the
 * mobile menu and the cart drawer can never be open together.
 */

type Overlay = "none" | "cart" | "menu";

type CommerceUIContextValue = {
  overlay: Overlay;
  isCartOpen: boolean;
  isMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  openMenu: () => void;
  closeMenu: () => void;
  closeAll: () => void;
};

const CommerceUIContext = createContext<CommerceUIContextValue | null>(null);

export function CommerceUIProvider({ children }: { children: ReactNode }) {
  const [overlay, setOverlay] = useState<Overlay>("none");
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);

  /*
   * Navigating away closes whatever is open — otherwise the menu stays mounted
   * over the new page and the body scroll lock never lifts.
   *
   * Adjusted during render rather than in an effect: React re-runs this
   * component immediately with the corrected state, before anything is shown,
   * so the overlay never paints over the destination page for a frame.
   */
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOverlay("none");
  }

  const openCart = useCallback(() => setOverlay("cart"), []);
  const openMenu = useCallback(() => setOverlay("menu"), []);
  const closeAll = useCallback(() => setOverlay("none"), []);

  const closeCart = useCallback(
    () => setOverlay((current) => (current === "cart" ? "none" : current)),
    [],
  );
  const closeMenu = useCallback(
    () => setOverlay((current) => (current === "menu" ? "none" : current)),
    [],
  );

  const value = useMemo(
    () => ({
      overlay,
      isCartOpen: overlay === "cart",
      isMenuOpen: overlay === "menu",
      openCart,
      closeCart,
      openMenu,
      closeMenu,
      closeAll,
    }),
    [overlay, openCart, closeCart, openMenu, closeMenu, closeAll],
  );

  return <CommerceUIContext.Provider value={value}>{children}</CommerceUIContext.Provider>;
}

export function useCommerceUI(): CommerceUIContextValue {
  const context = useContext(CommerceUIContext);
  if (!context) {
    throw new Error("useCommerceUI must be used within a <CommerceUIProvider>.");
  }
  return context;
}
