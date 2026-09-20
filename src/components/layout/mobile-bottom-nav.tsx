"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartIcon, HeartIcon, HomeIcon, ShieldIcon, WhatsAppIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/cart-context";
import { useCommerceUI } from "@/lib/commerce/ui-context";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { cn } from "@/lib/utils/cn";

/*
 * The phone tab bar.
 *
 * Five destinations, the pattern shoppers already know from retail apps: where
 * they are, what they can buy, what they saved, what they are buying, and how
 * to reach a human. It is hidden on checkout — a fixed bar over a payment form
 * competes with the one action on that screen, and on Android it sits on top
 * of the field a soft keyboard has just pushed up.
 */

const HIDDEN_ON = ["/checkout", "/order-confirmation"];

type Props = {
  productHref: string;
  whatsappUrl: string | null;
};

function Badge({ count, ready }: { count: number; ready: boolean }) {
  if (!ready || count <= 0) return null;

  return (
    <span
      aria-hidden="true"
      className="gk-anim-pop absolute top-0 right-0 grid h-4 min-w-4 -translate-y-0.5 translate-x-1 place-items-center rounded-full bg-primary px-1 text-[10px] leading-none font-medium text-primary-foreground ring-2 ring-white"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function itemClass(active: boolean) {
  return cn(
    // 44px+ target inside a 64px bar, with the label under the glyph.
    "relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius)] px-1 pt-1 transition-colors",
    active ? "gk-text-gradient" : "text-muted-foreground active:bg-muted",
  );
}

const labelClass = "text-[10.5px] leading-none font-medium tracking-tight";

export function MobileBottomNav({ productHref, whatsappUrl }: Props) {
  const pathname = usePathname();
  const { openCart } = useCommerceUI();
  const { totalItemCount, isReady: cartReady } = useCart();
  const { count: wishlistCount, isReady: wishlistReady } = useWishlist();

  if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

  const isHome = pathname === "/";
  const isProduct = pathname.startsWith(productHref);
  const isWishlist = pathname.startsWith("/wishlist");

  return (
    <nav
      aria-label="Quick navigation"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-1px_3px_rgba(26,26,26,0.05)] lg:hidden"
    >
      <div className="mx-auto flex h-[var(--gk-bottom-nav-h)] max-w-lg items-stretch gap-0.5 px-1.5">
        <Link href="/" aria-current={isHome ? "page" : undefined} className={itemClass(isHome)}>
          <HomeIcon className="size-[22px]" />
          <span className={labelClass}>Home</span>
        </Link>

        <Link
          href={productHref}
          aria-current={isProduct ? "page" : undefined}
          className={itemClass(isProduct)}
        >
          <ShieldIcon className="size-[22px]" />
          <span className={labelClass}>Product</span>
        </Link>

        <Link
          href="/wishlist"
          aria-current={isWishlist ? "page" : undefined}
          aria-label={`Wishlist${wishlistReady && wishlistCount > 0 ? `, ${wishlistCount} saved` : ""}`}
          className={itemClass(isWishlist)}
        >
          <span className="relative">
            <HeartIcon className="size-[22px]" />
            <Badge count={wishlistCount} ready={wishlistReady} />
          </span>
          <span className={labelClass}>Wishlist</span>
        </Link>

        <button
          type="button"
          onClick={openCart}
          aria-label={`Cart${cartReady && totalItemCount > 0 ? `, ${totalItemCount} ${totalItemCount === 1 ? "item" : "items"}` : ", empty"}`}
          className={itemClass(false)}
        >
          <span className="relative">
            <CartIcon className="size-[22px]" />
            <Badge count={totalItemCount} ready={cartReady} />
          </span>
          <span className={labelClass}>Cart</span>
        </button>

        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={itemClass(false)}
          >
            <WhatsAppIcon className="size-[22px]" />
            <span className={labelClass}>WhatsApp</span>
          </a>
        ) : null}
      </div>
    </nav>
  );
}
