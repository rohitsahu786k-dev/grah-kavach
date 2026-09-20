import type { Metadata } from "next";
import { BrandStory, Quality, ReviewsOrCommitment } from "@/components/home/brand-trust";
import { BuySection, FaqSection, FinalCta } from "@/components/home/conversion";
import { Hero } from "@/components/home/hero";
import { HeroBanners } from "@/components/home/hero-banners";
import { CompleteKit, ProductRoles, TrustBar, type ProductRole } from "@/components/home/product-story";
import { HowItWorks, Placement, RiskAreas } from "@/components/home/safety-education";
import { wooProductGallery, wooProductToSummary } from "@/lib/woocommerce/adapters";
import { getPrimaryProduct } from "@/lib/woocommerce/products";
import { getProductReviews } from "@/lib/woocommerce/reviews";
import {
  getFaqs,
  getHomePage,
  getPageBySlug,
  getProductContent,
  getTestimonials,
} from "@/lib/wordpress/adapters";
import { stripHtml } from "@/lib/wordpress/format";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import {
  buildFaqSchema,
  buildOrganizationSchema,
  buildProductSchema,
  buildWebSiteSchema,
} from "@/lib/seo/structured-data";
import type { Media } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const homePage = await getPageBySlug("home");

  return buildSeoMetadata({
    seo: homePage?.seo,
    fallbackTitle: "Graha Kavach — Complete 3-in-1 Home Fire Safety Kit",
    fallbackDescription:
      "A 2 kg ABC dry powder extinguisher, an automatic fire ball and a fire blanket in one kit, with the hardware to mount them. Made in Udaipur by Speciality Geochem.",
    path: "/",
  });
}

/* ------------------------------------------------------------------ */
/* Fallback copy                                                       */
/*                                                                     */
/* Used only where the CMS has nothing yet. Every line here is either  */
/* a statement of fact about the kit or a description of its purpose:  */
/* no certifications, no ratings, no claims about performance.         */
/* ------------------------------------------------------------------ */

const FALLBACK_TRUST = [
  { title: "Three-in-one safety kit", text: "Extinguisher, fire ball and blanket together." },
  { title: "Practical installation", text: "Bracket, stand and fixings included in the box." },
  { title: "Made in Udaipur", text: "Manufactured by Speciality Geochem, Rajasthan." },
  { title: "Preparedness focused", text: "Built around what a household can actually use." },
];

const FALLBACK_ROLES: Array<Omit<ProductRole, "image">> = [
  {
    name: "2 kg ABC Dry Powder Extinguisher",
    role: "Used by hand",
    description:
      "The device you reach for when a fire is small and you can approach it safely. ABC powder covers ordinary combustibles, flammable liquids and live electrical equipment.",
    placeholderLabel: "Fire Extinguisher Image",
  },
  {
    name: "Automatic Fire Ball",
    role: "Acts on its own",
    description:
      "Mounted near a known risk area, it responds to flame contact without anyone present — which matters for a cupboard or a panel nobody is standing next to.",
    placeholderLabel: "Fire Ball Image",
  },
  {
    name: "Fire Blanket, 1 m × 1 m",
    role: "Smothers",
    description:
      "Cuts off air to a small contained fire. The right first response to a pan on a stove, where powder would spread burning oil.",
    placeholderLabel: "Fire Blanket Image",
  },
];

const FALLBACK_FEATURES = [
  "2 kg ABC dry powder extinguisher with pressure gauge",
  "Automatic fire ball with mounting stand",
  "1 m × 1 m fibreglass fire blanket in a quick-release pouch",
  "Wall bracket, screws and wall plugs included",
];

const FALLBACK_KIT_CONTENTS = [
  "ABC Extinguisher",
  "Fire Ball",
  "Fire Blanket",
  "Wall Bracket",
  "Fire Ball Stand",
  "Screws and Wall Plugs",
].map((title) => ({ title, summary: "" }));

/**
 * Picks the gallery image that matches a product by name.
 *
 * WooCommerce returns gallery images in upload order, so relying on the index
 * alone would silently mis-label the three role cards the first time someone
 * reorders the gallery in the admin. Matching on the filename and alt text is
 * stable across that, and the index is only the last resort.
 */
function pickImage(gallery: Media[], keywords: string[], fallbackIndex: number): Media | null {
  const match = gallery.find((image) => {
    const haystack = `${image.url} ${image.alt}`.toLowerCase();
    return keywords.every((keyword) => haystack.includes(keyword));
  });

  return match ?? gallery[fallbackIndex] ?? null;
}

export default async function Home() {
  const product = await getPrimaryProduct();
  const summary = wooProductToSummary(product);

  const [homePage, productContent, faqs, reviews, testimonials] = await Promise.all([
    getHomePage(),
    getProductContent(product.slug),
    getFaqs(8),
    getProductReviews(product.id),
    getTestimonials(9),
  ]);

  const gallery: Media[] = [
    ...(productContent?.heroMedia ? [productContent.heroMedia] : []),
    ...wooProductGallery(product),
    ...(productContent?.galleryAdditions ?? []),
  ];

  const kitImage = pickImage(gallery, ["kit"], 0) ?? summary.image;
  const extinguisherImage = pickImage(gallery, ["extinguisher"], 1);
  const ballImage = pickImage(gallery, ["ball"], 2);
  const blanketImage = pickImage(gallery, ["blanket"], 3);

  const unpublished = product.status !== "publish";
  const unavailable = unpublished || summary.stockStatus === "outofstock";

  /* Hero copy: CMS first, then the product content, then the fallback. */
  const heroTitle =
    homePage?.heroTitle ||
    productContent?.headline ||
    "Three layers of fire preparedness. One complete kit.";

  const heroDescription =
    homePage?.heroDescription ||
    productContent?.heroSupportingText ||
    stripHtml(product.short_description) ||
    "An extinguisher for when you can act, a fire ball for when nobody is there, and a blanket for the kitchen — packed together with the hardware to mount them.";

  const trustItems = homePage?.trustItems?.length ? homePage.trustItems : FALLBACK_TRUST;

  /* The carousel replaces the built hero whenever banners exist in the CMS. */
  const hasBanners =
    (homePage?.heroBannersDesktop?.length ?? 0) > 0 ||
    (homePage?.heroBannersMobile?.length ?? 0) > 0;

  const roles: ProductRole[] = productContent?.roleCards.length
    ? productContent.roleCards.map((card, index) => ({
        name: card.title,
        role: card.role,
        description: card.text,
        image: [extinguisherImage, ballImage, blanketImage][index] ?? null,
        placeholderLabel: `${card.title} Image`,
      }))
    : FALLBACK_ROLES.map((role, index) => ({
        ...role,
        image: [extinguisherImage, ballImage, blanketImage][index] ?? null,
      }));

  const kitContents = productContent?.kitContents.length
    ? productContent.kitContents.map((item) => ({ title: item.title, summary: item.summary }))
    : FALLBACK_KIT_CONTENTS;

  const features = productContent?.keyBenefits.length
    ? productContent.keyBenefits.map((benefit) => benefit.title)
    : FALLBACK_FEATURES;

  const faqItems = productContent?.faqs.length ? productContent.faqs : faqs;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      buildOrganizationSchema(),
      buildWebSiteSchema(),
      ...(buildProductSchema(product, reviews) ? [buildProductSchema(product, reviews)] : []),
      ...(buildFaqSchema(faqItems.map((faq) => ({ q: faq.title, a: faq.answer })))
        ? [buildFaqSchema(faqItems.map((faq) => ({ q: faq.title, a: faq.answer })))]
        : []),
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {hasBanners ? (
        <>
          {/*
           * The page still needs exactly one H1, and the banner artwork
           * carries its headline as pixels rather than text. This keeps the
           * document outline and the search result intact without drawing
           * anything over the banner. The built hero below renders its own
           * H1, so this one only exists on the carousel path.
           */}
          <h1 className="sr-only">{heroTitle}</h1>

          <HeroBanners
            desktop={homePage?.heroBannersDesktop ?? []}
            mobile={homePage?.heroBannersMobile ?? []}
            links={homePage?.heroBannerLinks ?? []}
            autoplaySeconds={homePage?.heroBannerAutoplay ?? null}
          />
        </>
      ) : (
        /* No banners uploaded yet — the built hero keeps the page complete. */
        <Hero
          eyebrow={homePage?.heroEyebrow || "Fire safety, made ready"}
          title={heroTitle}
          description={heroDescription}
          primaryCta={{
            label: homePage?.heroCtaPrimaryLabel || "Shop the Kit",
            href: homePage?.heroCtaPrimaryUrl || "/fire-safety-kit",
          }}
          secondaryCta={{
            label: homePage?.heroCtaSecondaryLabel || "How It Works",
            href: homePage?.heroCtaSecondaryUrl || "#how-it-works",
          }}
          kitImage={kitImage}
          partImages={[extinguisherImage, ballImage, blanketImage].filter(
            (image): image is Media => Boolean(image),
          )}
          trustItems={trustItems.map((item) => item.title)}
        />
      )}

      <TrustBar items={trustItems} />

      <ProductRoles items={roles} />

      <CompleteKit image={kitImage} contents={kitContents} />

      <RiskAreas />

      <HowItWorks />

      <BuySection
        product={summary}
        stockQuantity={product.stock_quantity ?? null}
        gallery={gallery}
        features={features}
        unavailable={unavailable}
        unpublished={unpublished}
      />

      <Placement />

      <BrandStory notesHtml={productContent?.manufacturerNotes || null} />

      <Quality certifications={productContent?.certifications ?? []} />

      <ReviewsOrCommitment reviews={reviews} testimonials={testimonials} />

      <FaqSection
        title={homePage?.faqTitle || "Common questions"}
        items={faqItems.map((faq) => ({ id: faq.id, title: faq.title, answer: faq.answer }))}
      />

      <FinalCta image={kitImage} product={summary} unavailable={unavailable} />
    </main>
  );
}
