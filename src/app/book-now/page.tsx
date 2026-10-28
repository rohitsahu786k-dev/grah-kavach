import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CountdownProvider } from "@/components/landing/countdown";
import { LandingView } from "@/components/landing/landing-view";
import { LandingViewTracker } from "@/components/landing/landing-view-tracker";
import { getLandingPricing } from "@/lib/landing/pricing";
import { fillTokens } from "@/lib/landing/text";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/structured-data";
import { getGlobalSiteSettings, getLanding, getPageBySlug } from "@/lib/wordpress/adapters";

/*
 * Campaign landing page. Copy and images come from the "Book Now" WordPress
 * page, SEO from its Yoast box, and prices from the WooCommerce product, so
 * nothing on it is hard-coded.
 */

export const revalidate = 300;

const FALLBACK_TITLE = "Graha Kavach 3-in-1 फ़ायर सेफ़्टी किट: बुक करें";
const FALLBACK_DESCRIPTION =
  "Graha Kavach 3-in-1 होम फ़ायर सेफ़्टी किट बुक करें: फ़ायर एक्सटिंग्विशर, फ़ायर बॉल और फ़ायर ब्लैंकेट। मुफ़्त डिलीवरी, कैश ऑन डिलीवरी।";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("book-now").catch(() => null);

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: FALLBACK_TITLE,
    fallbackDescription: FALLBACK_DESCRIPTION,
    path: "/book-now",
  });
}

export default async function BookNowPage() {
  const [landing, pricing, settings] = await Promise.all([getLanding(), getLandingPricing(), getGlobalSiteSettings()]);

  if (!landing || !pricing) notFound();

  const faqSchema = buildFaqSchema(
    landing.faqs.map((faq) => ({
      q: fillTokens(faq.q, pricing, landing.endTime),
      a: fillTokens(faq.a, pricing, landing.endTime),
    })),
  );
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Book Now", path: "/book-now" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /> : null}
      <LandingViewTracker productId={pricing.productId} valueMinor={pricing.priceMinor} />
      <CountdownProvider config={{ endTime: landing.endTime, endsAt: landing.endsAt }}>
        <LandingView landing={landing} pricing={pricing} logo={{ url: settings.logo?.url ?? "/brand/graha-kavach-logo.png", alt: settings.logo?.alt || "Graha Kavach" }} />
      </CountdownProvider>
    </>
  );
}
