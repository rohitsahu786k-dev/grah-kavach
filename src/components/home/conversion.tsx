import Image from "next/image";
import { PurchasePanel } from "@/components/commerce/purchase-panel";
import { StockStatus } from "@/components/commerce/stock-status";
import { Accordion } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import type { Media, ProductSummary } from "@/types";

/* ------------------------------------------------------------------ */
/* Section 7 — the buy section                                         */
/* ------------------------------------------------------------------ */

type BuyProps = {
  product: ProductSummary;
  stockQuantity: number | null;
  gallery: Media[];
  features: string[];
  unavailable: boolean;
  unpublished: boolean;
};

/**
 * The transaction, in the middle of the page.
 *
 * Price, sale price and stock are WooCommerce values passed straight through.
 * The sale price is only marked as a reduction when the regular price is
 * genuinely higher — there is no permanent "was" figure here.
 */
export function BuySection({
  product,
  stockQuantity,
  gallery,
  features,
  unavailable,
  unpublished,
}: BuyProps) {
  const onSale =
    typeof product.regularPriceMinor === "number" &&
    typeof product.priceMinor === "number" &&
    product.regularPriceMinor > product.priceMinor;

  const savingMinor =
    onSale && product.regularPriceMinor && product.priceMinor
      ? product.regularPriceMinor - product.priceMinor
      : 0;

  const main = gallery[0] ?? product.image;
  const thumbs = gallery.slice(1, 4);

  return (
    <section id="buy" className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <div className="">
              {main?.url ? (
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={main.url}
                    alt={main.alt || product.name}
                    fill
                    sizes="(max-width: 1023px) 92vw, 50vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <MediaPlaceholder label="Product Image" aspect="4/3" />
              )}
            </div>

            {thumbs.length > 0 ? (
              <ul className="mt-3 grid grid-cols-3 gap-3">
                {thumbs.map((image) => (
                  <li
                    key={image.url}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-border bg-white"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || ""}
                      fill
                      sizes="(max-width: 1023px) 30vw, 16vw"
                      className="object-contain p-2"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="lg:py-4">
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              Get protected
            </p>
            <h2 className="mt-4 text-3xl leading-[1.15] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[40px]">
              {product.name}
            </h2>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-3xl font-medium text-foreground">
                {formatMinorUnitsToCurrency(product.priceMinor, product.currency)}
              </span>
              {onSale ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatMinorUnitsToCurrency(product.regularPriceMinor, product.currency)}
                  </span>
                  <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-medium text-primary">
                    Save {formatMinorUnitsToCurrency(savingMinor, product.currency)}
                  </span>
                </>
              ) : null}
            </div>

            <div className="mt-3">
              <StockStatus status={product.stockStatus} quantity={stockQuantity} />
            </div>

            {features.length > 0 ? (
              <ul className="mt-6 grid gap-2.5 border-y border-border py-5">
                {features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm leading-6 text-foreground-muted"
                  >
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            ) : null}

            {unpublished ? (
              <p className="mt-6 rounded-[var(--radius)] border border-warning/30 bg-warning-subtle px-4 py-3 text-sm leading-6 text-warning">
                This product is not currently published in the store, so it cannot be ordered.
              </p>
            ) : null}

            <PurchasePanel
              className="mt-7"
              productId={product.id}
              productName={product.name}
              disabled={unavailable}
              maxQuantity={stockQuantity}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 12 — FAQ                                                    */
/* ------------------------------------------------------------------ */

export type FaqItem = { id: string | number; title: string; answer: string };

export function FaqSection({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section id="faq" className="bg-background py-16 lg:py-24">
      <Container width="default">
        <div className="mx-auto max-w-3xl">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">FAQ</p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            {title}
          </h2>

          {items.length > 0 ? (
            <Accordion
              className="mt-8"
              items={items.map((faq) => ({
                id: String(faq.id),
                question: faq.title,
                answer: <span dangerouslySetInnerHTML={{ __html: faq.answer }} />,
              }))}
            />
          ) : (
            <p className="mt-8 rounded-[var(--radius)] border border-dashed border-border-strong p-6 leading-7 text-foreground-muted">
              Questions and answers appear here once they are published in the CMS.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 13 — closing call to action                                 */
/* ------------------------------------------------------------------ */

export function FinalCta({
  image,
  product,
  unavailable,
}: {
  image: Media | null;
  product: ProductSummary;
  unavailable: boolean;
}) {
  return (
    <section className="border-t border-border bg-background-subtle py-16 lg:py-24">
      <Container width="wide">
        <div className="grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="rounded-[var(--radius)] border border-border bg-white p-6 lg:p-10">
            {image?.url ? (
              <div className="relative aspect-[16/10] w-full">
                <Image
                  src={image.url}
                  alt={image.alt || product.name}
                  fill
                  sizes="(max-width: 1023px) 92vw, 46vw"
                  className="object-contain"
                />
              </div>
            ) : (
              <MediaPlaceholder label="Closing Lifestyle Image" aspect="16/9" />
            )}
          </div>

          <div>
            <h2 className="text-3xl leading-[1.12] font-medium tracking-[-0.025em] text-balance text-foreground lg:text-[46px]">
              The day you need it is not the day to buy it.
            </h2>
            <p className="mt-5 max-w-xl leading-8 text-foreground-muted">
              One kit, mounted where you can reach it, covering the three responses a small fire
              calls for.
            </p>

            <p className="mt-6 text-2xl font-medium text-foreground">
              {formatMinorUnitsToCurrency(product.priceMinor, product.currency)}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {/* Still a link when out of stock — the product page is where the
                  customer finds out when it is back — but marked as such. */}
              <Button
                href="/fire-safety-kit"
                size="lg"
                aria-disabled={unavailable ? true : undefined}
              >
                {unavailable ? "View Product" : "Get Graha Kavach"}
                <ArrowRightIcon className="size-4" />
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Ask a Question
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
