"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CartIcon, HeartIcon, MenuIcon, UserIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/cart-context";
import { useCommerceUI } from "@/lib/commerce/ui-context";
import { useCustomer } from "@/lib/auth/use-customer";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { overlaysHero } from "@/lib/layout/routes";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/lib/wordpress/adapters";
import type { WpMedia } from "@/lib/wordpress/types";
import { MobileMenu } from "./mobile-menu";

export type HeaderBarProps = {
  brandName: string;
  logo: WpMedia | null;
  navigation: NavItem[];
  cta: NavItem;
  announcement: { text: string; href: string } | null;
  whatsappUrl: string | null;
};

/** A small count bubble. Hidden at zero — an empty badge is noise. */
function CountBadge({ count, ready }: { count: number; ready: boolean }) {
  if (!ready || count <= 0) return null;

  return (
    <span
      className="gk-anim-pop absolute -top-1 -right-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-medium text-primary-foreground"
      // The count is already part of the button's accessible name.
      aria-hidden="true"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function HeaderBar({
  brandName,
  logo,
  navigation,
  cta,
  announcement,
  whatsappUrl,
}: HeaderBarProps) {
  const pathname = usePathname();
  const { openCart, openMenu, isMenuOpen } = useCommerceUI();
  const { totalItemCount, isReady: cartReady } = useCart();
  const { count: wishlistCount, isReady: wishlistReady } = useWishlist();
  const { customer } = useCustomer();

  const isOverlayRoute = overlaysHero(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Read once on mount too: a reload halfway down the page must not paint a
    // transparent header over body copy.
    function update() {
      setScrolled(window.scrollY > 24);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Solid whenever the page is scrolled, and always on routes without a
  // full-bleed hero.
  const solid = scrolled || !isOverlayRoute;

  const wishlistLabel = `Wishlist${wishlistReady && wishlistCount > 0 ? `, ${wishlistCount} saved` : ""}`;
  const cartLabel = `Cart${cartReady && totalItemCount > 0 ? `, ${totalItemCount} ${totalItemCount === 1 ? "item" : "items"}` : ", empty"}`;

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40">
        {announcement ? (
          <Link
            href={announcement.href}
            className="flex min-h-10 items-center justify-center bg-foreground px-4 text-center text-xs leading-5 text-white sm:text-sm"
          >
            {announcement.text}
          </Link>
        ) : null}

        <header
          // The desktop surface is chosen in CSS from this attribute — see the
          // header-surface block in globals.css for why it is not a class.
          data-header={solid ? "solid" : "transparent"}
          className="overflow-hidden border-b border-border bg-white transition-[background-color,border-color,box-shadow] duration-300 ease-out"
        >
          <div className="mx-auto flex h-[var(--gk-header-h)] w-full max-w-[1400px] items-center gap-3 px-4 xs:px-5 lg:gap-6 lg:px-8 xl:px-10">
            {/* Mobile: menu button first, so the thumb reaches it. */}
            <button
              type="button"
              onClick={openMenu}
              aria-expanded={isMenuOpen}
              aria-label="Open menu"
              className="-ml-2 grid size-11 shrink-0 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <MenuIcon className="size-6" />
            </button>

            <Link
              href="/"
              className="flex min-w-0 items-center"
              aria-label={`${brandName} home`}
            >
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt=""
                  width={logo.width ?? 96}
                  height={logo.height ?? 96}
                  className=""
                  priority
                />
              ) : (
                <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius)] bg-primary text-sm font-medium text-primary-foreground lg:size-11">
                  GK
                </span>
              )}
            </Link>

            <nav aria-label="Main" className="ml-auto hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                const active =
                  item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-[var(--radius)] px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "gk-text-gradient"
                        : "text-foreground-muted hover:bg-muted/70 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-auto flex items-center gap-0.5 lg:ml-0 lg:gap-1">
              <Link
                href={customer ? "/account" : "/account/login"}
                aria-label={customer ? "Your account" : "Sign in"}
                title={customer ? "Your account" : "Sign in"}
                className="hidden size-11 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted lg:grid"
              >
                <UserIcon className="size-5" />
              </Link>

              <Link
                href="/wishlist"
                aria-label={wishlistLabel}
                title="Wishlist"
                className="relative grid size-11 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted"
              >
                <HeartIcon className="size-5" />
                <CountBadge count={wishlistCount} ready={wishlistReady} />
              </Link>

              <button
                type="button"
                onClick={openCart}
                aria-label={cartLabel}
                title="Cart"
                className="relative grid size-11 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted"
              >
                <CartIcon className="size-5" />
                <CountBadge count={totalItemCount} ready={cartReady} />
              </button>

              <Button href={cta.href} size="sm" className="ml-2 hidden xl:inline-flex">
                {cta.label}
              </Button>
            </div>
          </div>
        </header>
      </div>

      <MobileMenu
        brandName={brandName}
        logo={logo}
        navigation={navigation}
        cta={cta}
        whatsappUrl={whatsappUrl}
      />
    </>
  );
}
