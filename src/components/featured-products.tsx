import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/commerce/product-card";
import type { ProductSummary } from "@/types";

export function FeaturedProducts({ products }: { products: ProductSummary[] }) {
  return (
    <section className="border-t border-stone-200 bg-stone-50 py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              Fire safety kit
            </p>
            <h2 className="mt-2 text-3xl font-medium text-stone-950">
              Get protected at home and work
            </h2>
          </div>
          <Button variant="outline" href="/fire-safety-kit">
            View kit
          </Button>
        </div>

        {products.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-dashed border-stone-300 bg-white p-8 text-stone-600">
            No fire safety kit is currently published in WooCommerce.
          </div>
        )}
      </div>
    </section>
  );
}
