import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HeaderSpacer } from "@/components/layout/header-spacer";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/ui/toast";
import { CustomerProvider } from "@/lib/auth/customer-context";
import { CartProvider } from "@/lib/cart/cart-context";
import { CommerceUIProvider } from "@/lib/commerce/ui-context";
import { buildWhatsAppUrl } from "@/lib/config/contact";
import { brandAssets } from "@/lib/config/brand";
import { siteConfig } from "@/lib/config/site";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";
import { getGlobalSiteSettings } from "@/lib/wordpress/adapters";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  // Only 400 and 500 are ever used. Loading 600+ would let a stray utility
  // class introduce a weight the brand does not use.
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.frontendUrl),
  title: {
    default: "Graha Kavach",
    template: "%s | Graha Kavach",
  },
  description:
    "Graha Kavach is a home and workplace fire-safety brand focused on practical emergency readiness.",
  alternates: {
    canonical: siteConfig.frontendUrl,
  },
  openGraph: {
    title: "Graha Kavach",
    description: "Explore the Graha Kavach fire-safety kit for homes and workplaces.",
    url: siteConfig.frontendUrl,
    siteName: "Graha Kavach",
    type: "website",
  },
  icons: {
    icon: [
      { url: brandAssets.favicon, type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: brandAssets.favicon,
    apple: brandAssets.favicon,
  },
};

const PRODUCT_HREF = "/fire-safety-kit";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getGlobalSiteSettings();
  const whatsappUrl = buildWhatsAppUrl(
    settings.contact.whatsapp,
    settings.contact.phone,
    "Hello Graha Kavach, I would like to know more about the fire safety kit.",
  );

  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased`}
      /*
       * The announcement bar is optional and opaque, so its height is part of
       * every top offset on the site: the header spacer, the hero's top
       * padding and the scroll-margin of anchor targets all read it. Setting it
       * here, where whether the bar exists is actually known, keeps those three
       * in agreement.
       */
      style={
        settings.announcement
          ? ({ "--gk-announcement-h": "40px" } as React.CSSProperties)
          : undefined
      }
    >
      {/*
       * Provider order matters: the wishlist merges on sign-in, so it has to sit
       * inside the customer provider. The commerce UI provider owns which
       * overlay is open and is read by the header, the tab bar and the drawer.
       */}
      <body className="flex min-h-full flex-col bg-white text-foreground">
        <CustomerProvider>
          <WishlistProvider>
            <CartProvider>
              <CommerceUIProvider>
                <ToastProvider>
                  <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[var(--radius)] focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:text-white"
                  >
                    Skip to content
                  </a>

                  <SiteHeader />
                  <HeaderSpacer />

                  <div id="main" className="flex-1">
                    {children}
                  </div>

                  <SiteFooter />

                  {/* Reserves the height of the fixed tab bar on phones. */}
                  <div aria-hidden="true" className="gk-bottom-nav-offset" />

                  <MobileBottomNav productHref={PRODUCT_HREF} whatsappUrl={whatsappUrl} />
                  <CartDrawer />
                </ToastProvider>
              </CommerceUIProvider>
            </CartProvider>
          </WishlistProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}
