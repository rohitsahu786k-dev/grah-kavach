import type { Metadata } from "next";
import Link from "next/link";
import { WishlistClient } from "@/components/wishlist/wishlist-client";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Products you have saved from the Graha Kavach store.",
  // A personal list has nothing to offer a search engine and should not be
  // indexed even if a URL leaks.
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return (
    <main className="bg-background-subtle/60">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-10 xs:px-5 lg:px-8 lg:py-14 xl:px-10">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">Wishlist</li>
          </ol>
        </nav>

        <header className="mt-4 border-b border-border pb-6">
          <h1 className="text-3xl font-medium tracking-tight text-foreground lg:text-4xl">
            Your Wishlist
          </h1>
          <p className="mt-2 max-w-2xl leading-7 text-foreground-muted">
            Saved products, with live prices and stock from the store.
          </p>
        </header>

        <div className="mt-8">
          <WishlistClient />
        </div>
      </div>
    </main>
  );
}
