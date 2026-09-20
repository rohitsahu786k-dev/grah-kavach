import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/commerce/price";
import { PurchaseActions } from "@/components/commerce/purchase-actions";
import { SecurePaymentStrip } from "@/components/commerce/secure-payment-strip";
import { StockStatus } from "@/components/commerce/stock-status";
import { ResponsiveImage } from "@/components/ui/responsive-image";

import {
  formatMinorUnitsToCurrency,
  wooProductGallery,
  wooProductToSummary,
} from "@/lib/woocommerce/adapters";
import { getPrimaryProduct } from "@/lib/woocommerce/products";
import { getProductReviews } from "@/lib/woocommerce/reviews";
import { getPosts, getProductContent } from "@/lib/wordpress/adapters";
import { stripHtml } from "@/lib/wordpress/format";
import { isNotFound } from "@/lib/errors";

export const dynamic = "force-dynamic";

const fallbackSpecs = [
  ["Extinguisher", "Capacity", "2 kg ABC dry powder"],
  ["Extinguisher", "Discharge", "10-12 sec brochure-listed discharge"],
  ["Extinguisher", "Throw", "3-4 m brochure-listed throw"],
  ["Fire Ball", "Weight", "1.3 kg"],
  ["Fire Ball", "Agent", "MAP powder"],
  ["Fire Ball", "Shelf life", "5-year brochure-listed shelf life"],
  ["Fire Blanket", "Size", "1 x 1 m"],
  ["Fire Blanket", "Material", "Fibreglass"],
  ["Fire Blanket", "Heat resistance", "550°C brochure-listed heat-resistance figure"],
];

const storySections = [
  ["Why this kit exists", "Fire preparedness is easier to act on when the core tools are grouped, visible, and understandable."],
  ["The three protection layers", "Manual response, flame-activated support, and a smothering option each serve a different emergency role."],
  ["Where to place each item", "Keep each product accessible, visible, and positioned according to supplied instructions."],
  ["Fire emergency do/don't", "Prioritize people, call emergency services when needed, and never fight a fire that is growing or blocking escape."],
];

async function getKitData() {
  try {
    const product = await getPrimaryProduct();
    const [content, reviews, relatedPosts] = await Promise.all([
      getProductContent(product.slug),
      getProductReviews(product.id),
      getPosts(3),
    ]);

    return { product, content, reviews, relatedPosts };
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildProductSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const { product, content } = await getKitData();
  const title = content?.headline ? `${content.headline} | Graha Kavach` : `${product.name} — Complete 3-in-1 Fire Safety Kit`;
  const description =
    content?.heroSupportingText ||
    stripHtml(product.short_description) ||
    "Certified 3-in-1 domestic fire safety kit: 2kg ABC dry powder extinguisher, automatic fire ball, and 550°C fibreglass blanket.";

  return buildSeoMetadata({
    fallbackTitle: title,
    fallbackDescription: description,
    path: "/fire-safety-kit",
    fallbackImage: product.images[0]?.src,
  });
}

export default async function FireSafetyKitPage() {
  const { product, content, reviews, relatedPosts } = await getKitData();
  const summary = wooProductToSummary(product);
  const gallery = [
    ...(content?.heroMedia ? [content.heroMedia] : []),
    ...wooProductGallery(product),
    ...(content?.galleryAdditions ?? []),
  ];
  const heroImage = gallery[0] ?? summary.image;
  const unavailable = product.status !== "publish" || summary.stockStatus === "outofstock";

  const specs = content?.specifications.length ? content.specifications.map((spec) => [spec.group, spec.label, spec.value]) : fallbackSpecs;

  const productSchema = buildProductSchema(product, reviews);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Fire Safety Kit", path: "/fire-safety-kit" },
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...(productSchema ? [productSchema] : []),
      breadcrumbSchema,
    ],
  };

  return (
    <main className="pb-24 lg:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5 text-sm text-muted-foreground lg:px-10">
          <Link href="/">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">Fire Safety Kit</span>
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-10">
          <div>
            <ResponsiveImage
              media={heroImage}
              alt={product.name}
              aspect="square"
              fit="contain"
              priority
              className="border border-border bg-background-subtle p-4"
              sizes="(max-width: 1023px) 94vw, 50vw"
            />
            {gallery.length > 1 ? (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(1, 5).map((image) => (
                  <ResponsiveImage
                    key={image.url}
                    media={image}
                    alt={image.alt || product.name}
                    aspect="square"
                    fit="contain"
                    className="border border-border bg-white p-2"
                    sizes="120px"
                  />
                ))}
              </div>
            ) : null}
          </div>

          <div className="lg:sticky lg:top-28 lg:self-start">
            <Badge tone="primary">Fire Safety Kit</Badge>
            <h1 className="mt-4 text-4xl font-medium leading-tight text-foreground lg:text-5xl">
              {content?.headline || product.name}
            </h1>
            <p className="mt-5 text-lg leading-8 text-foreground-muted">
              {content?.heroSupportingText || stripHtml(product.short_description)}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Price
                amountMinor={summary.priceMinor}
                compareAtMinor={summary.regularPriceMinor}
                currency={summary.currency}
                size="lg"
              />
              <StockStatus status={summary.stockStatus} quantity={product.stock_quantity} />
            </div>

            {product.status !== "publish" ? (
              <div className="mt-6 border border-warning bg-warning-subtle p-4 text-sm text-warning">
                This WooCommerce product is currently not published. Product details are shown from backend data, but purchase actions are disabled.
              </div>
            ) : null}

            {product.sku ? (
              <p className="mt-3 text-sm text-muted-foreground">SKU: {product.sku}</p>
            ) : null}

            <div className="mt-8">
              <PurchaseActions
                productId={product.id}
                productName={product.name}
                maxQuantity={product.stock_quantity ?? null}
                disabled={unavailable}
              />
            </div>

            <div className="mt-8 grid gap-3 border-y border-border py-5 text-sm text-foreground-muted sm:grid-cols-3">
              <span>WooCommerce checkout</span>
              <span>CMS safety guide</span>
              <span>No fake scarcity</span>
            </div>

            <SecurePaymentStrip className="mt-6" />
          </div>
        </div>
      </section>

      <section className="bg-background-subtle py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {storySections.map(([title, text]) => (
            <article className="border border-border bg-white p-5" key={title}>
              <h2 className="font-medium text-foreground">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-foreground-muted">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Inside the box</p>
          <h2 className="mt-3 text-3xl font-medium text-foreground">Everything in the kit.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(content?.kitContents.length ? content.kitContents : []).map((item) => (
              <article className="border border-border bg-background-subtle p-4" key={item.id}>
                <ResponsiveImage media={item.image ?? null} alt={item.title} aspect="square" fit="contain" />
                <h3 className="mt-4 font-medium">{item.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted">{item.summary || item.quantity}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background-subtle py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Specifications</p>
          <h2 className="mt-3 text-3xl font-medium text-foreground">Verified product information.</h2>
          <div className="mt-8 overflow-hidden border border-border bg-white">
            {specs.map(([group, label, value]) => (
              <div className="grid gap-2 border-b border-border p-4 last:border-b-0 md:grid-cols-[0.8fr_1fr_1.4fr]" key={`${group}-${label}`}>
                <span className="gk-text-gradient text-sm font-medium">{group}</span>
                <span className="font-medium text-foreground">{label}</span>
                <span className="text-foreground-muted">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Placement and use</p>
            <h2 className="mt-3 text-3xl font-medium text-foreground">Use safely, and only when appropriate.</h2>
            <div className="mt-6 border border-warning bg-warning-subtle p-4 text-sm leading-6 text-warning">
              These previews do not replace the supplied product instructions. If a fire is growing, spreading, or blocking escape, leave and call emergency services.
            </div>
          </div>
          <div className="space-y-6 leading-7 text-foreground-muted">
            {content?.installation ? <div dangerouslySetInnerHTML={{ __html: content.installation }} /> : null}
            {content?.usage ? <div dangerouslySetInnerHTML={{ __html: content.usage }} /> : null}
            {content?.warnings.length ? (
              <div className="grid gap-3">
                {content.warnings.map((warning) => (
                  <div className="border border-border bg-background-subtle p-4" key={warning.title}>
                    <p className="gk-text-gradient text-sm font-medium">{warning.level || "Safety note"}</p>
                    <h3 className="mt-1 font-medium text-foreground">{warning.title}</h3>
                    <p className="mt-2 text-sm">{warning.text}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="bg-background-subtle py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Manufacturer</p>
          <h2 className="mt-3 text-3xl font-medium text-foreground">Speciality Geochem.</h2>
          <div className="mt-5 max-w-3xl leading-8 text-foreground-muted">
            {content?.manufacturerNotes ? (
              <div dangerouslySetInnerHTML={{ __html: content.manufacturerNotes }} />
            ) : (
              <p>Source material indicates manufacturing experience since 2010 in Udaipur.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Certifications</p>
          <h2 className="mt-3 text-3xl font-medium text-foreground">CMS-managed verified documents.</h2>
          {content?.certifications.length ? (
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {content.certifications.map((cert) => (
                <article className="border border-border bg-background-subtle p-5" key={cert.id}>
                  <h3 className="font-medium text-foreground">{cert.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground-muted">{cert.summary || cert.issuer}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-8 border border-dashed border-border p-6 text-foreground-muted">
              Verified certification claims will appear here when published in the CMS.
            </div>
          )}
        </div>
      </section>

      <section className="bg-background-subtle py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:px-10">
          <div>
            <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">FAQ</p>
            <h2 className="mt-3 text-3xl font-medium text-foreground">Product questions.</h2>
            {content?.faqs.length ? (
              <Accordion
                className="mt-8"
                items={content.faqs.map((faq) => ({
                  id: String(faq.id),
                  question: faq.title,
                  answer: <span dangerouslySetInnerHTML={{ __html: faq.answer }} />,
                }))}
              />
            ) : (
              <div className="mt-8 border border-dashed border-border bg-white p-6 text-foreground-muted">
                Product FAQ content will appear here after it is published in the CMS.
              </div>
            )}
          </div>

          <div>
            <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Reviews</p>
            <h2 className="mt-3 text-3xl font-medium text-foreground">WooCommerce reviews.</h2>
            {reviews.length ? (
              <div className="mt-8 grid gap-4">
                {reviews.map((review) => (
                  <article className="border border-border bg-white p-5" key={review.id}>
                    <Badge tone="success">{review.rating}/5</Badge>
                    <p className="mt-4 leading-7 text-foreground-muted" dangerouslySetInnerHTML={{ __html: review.review }} />
                    <p className="mt-4 font-medium text-foreground">{review.reviewer}</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-8 border border-dashed border-border bg-white p-6 text-foreground-muted">
                No WooCommerce reviews are published yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="gk-text-gradient text-sm font-medium uppercase tracking-[0.18em]">Related safety articles</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {relatedPosts.map((post) => (
              <article className="border border-border bg-background-subtle p-5" key={post.databaseId}>
                <h3 className="text-lg font-medium text-foreground">{stripHtml(post.title)}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-foreground-muted">{stripHtml(post.excerpt)}</p>
                <Link className="gk-text-gradient mt-5 inline-flex text-sm font-medium" href={`/blog/${post.slug}`}>
                  Read article
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <PurchaseActions
        productId={product.id}
        productName={product.name}
        maxQuantity={product.stock_quantity ?? null}
        disabled={unavailable}
        priceLabel={formatMinorUnitsToCurrency(summary.priceMinor, summary.currency)}
        mobile
      />
    </main>
  );
}
