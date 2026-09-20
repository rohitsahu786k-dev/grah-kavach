"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRightIcon,
  CloseIcon,
  HeartIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  WhatsAppIcon,
} from "@/components/ui/icons";
import { useCommerceUI } from "@/lib/commerce/ui-context";
import { useCustomer } from "@/lib/auth/use-customer";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { useOverlayBehavior } from "@/lib/hooks/use-overlay-behavior";
import { cn } from "@/lib/utils/cn";
import type { NavItem } from "@/lib/wordpress/adapters";
import type { WpMedia } from "@/lib/wordpress/types";

type MobileMenuProps = {
  brandName: string;
  logo: WpMedia | null;
  navigation: NavItem[];
  cta: NavItem;
  whatsappUrl: string | null;
};

/*
 * The phone navigation panel.
 *
 * This is not the desktop header at a smaller size: it is a full-height white
 * sheet with 56px rows, which is what a thumb can hit reliably while holding a
 * phone one-handed. Closing on route change is handled centrally by the
 * commerce UI provider, so every link here — including ones added later —
 * dismisses the panel without needing its own onClick.
 */
export function MobileMenu({ logo, navigation, cta, whatsappUrl }: MobileMenuProps) {
  const { isMenuOpen, closeMenu } = useCommerceUI();
  const { customer } = useCustomer();
  const { count: wishlistCount, isReady: wishlistReady } = useWishlist();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  useOverlayBehavior({ open: isMenuOpen, onClose: closeMenu, panelRef });

  // Only ever open after an interaction, so it is closed during server
  // rendering and hydration and the document check is sufficient.
  if (!isMenuOpen || typeof document === "undefined") return null;

  const secondary: Array<{ label: string; href: string; icon: React.ReactNode; badge?: number }> = [
    {
      label: customer ? "Your Account" : "Sign In",
      href: customer ? "/account" : "/account/login",
      icon: <UserIcon className="size-5" />,
    },
    {
      label: "Wishlist",
      href: "/wishlist",
      icon: <HeartIcon className="size-5" />,
      badge: wishlistReady ? wishlistCount : 0,
    },
    { label: "Track Order", href: "/track-order", icon: <TruckIcon className="size-5" /> },
    { label: "Contact", href: "/contact", icon: <PhoneIcon className="size-5" /> },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex lg:hidden">
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        onClick={closeMenu}
        className="gk-anim-fade-in absolute inset-0 cursor-default bg-foreground/40"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        tabIndex={-1}
        className="gk-anim-slide-left relative flex h-full w-full max-w-[380px] flex-col bg-white shadow-2xl outline-none"
      >
        <div className="flex h-[var(--gk-header-h)] shrink-0 items-center justify-between gap-3 border-b border-border px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            {logo?.url ? (
              <Image
                src={logo.url}
                alt=""
                width={logo.width ?? 96}
                height={logo.height ?? 96}
                className="h-9 max-w-[160px] object-contain"
              />
            ) : null}
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            data-autofocus
            aria-label="Close menu"
            className="-mr-2 grid size-11 place-items-center rounded-[var(--radius)] text-foreground transition-colors hover:bg-muted"
          >
            <CloseIcon className="size-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <nav aria-label="Main" className="px-2 py-2">
            {navigation.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 items-center justify-between gap-3 rounded-[var(--radius)] px-3 text-[17px] font-medium transition-colors",
                    active ? "bg-primary-subtle gk-text-gradient" : "text-foreground active:bg-muted",
                  )}
                >
                  {item.label}
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </nav>

          <div className="mx-4 border-t border-border" />

          <nav aria-label="Account and support" className="px-2 py-2">
            {secondary.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-12 items-center gap-3 rounded-[var(--radius)] px-3 text-[15px] text-foreground-muted transition-colors active:bg-muted"
              >
                <span className="text-muted-foreground">{item.icon}</span>
                {item.label}
                {item.badge ? (
                  <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            ))}

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 items-center gap-3 rounded-[var(--radius)] px-3 text-[15px] text-foreground-muted transition-colors active:bg-muted"
              >
                <span className="text-muted-foreground">
                  <WhatsAppIcon className="size-5" />
                </span>
                WhatsApp
              </a>
            ) : null}
          </nav>
        </div>

        <div className="shrink-0 border-t border-border px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Button href={cta.href} fullWidth size="lg">
            {cta.label}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
