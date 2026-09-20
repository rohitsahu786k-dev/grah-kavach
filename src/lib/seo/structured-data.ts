import { siteConfig } from "@/lib/config/site";
import { stripHtml } from "@/lib/wordpress/format";
import type { WooProduct } from "@/lib/woocommerce/types";
import type { WooReview as WooProductReview } from "@/lib/woocommerce/types";

const BASE_URL = siteConfig.frontendUrl.replace(/\/$/, "");

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "Graha Kavach",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${BASE_URL}/#logo`,
      url: `${BASE_URL}/logo.png`,
      caption: "Graha Kavach Fire Safety",
    },
    telephone: "+91-9610251841",
    email: "grahakavach@gmail.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "103, Ostwal Plaza 2, Sundarwas",
      addressLocality: "Udaipur",
      addressRegion: "Rajasthan",
      postalCode: "313001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://facebook.com",
      "https://instagram.com",
      "https://linkedin.com",
    ],
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    url: BASE_URL,
    name: "Graha Kavach",
    description: "Domestic and residential fire safety solutions for Indian homes.",
    publisher: {
      "@id": `${BASE_URL}/#organization`,
    },
    inLanguage: "en-IN",
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.path.startsWith("http")
        ? item.path
        : `${BASE_URL}${item.path.startsWith("/") ? item.path : `/${item.path}`}`,
    })),
  };
}

export function buildProductSchema(
  product: WooProduct | null,
  reviews: WooProductReview[] = []
) {
  if (!product) return null;

  const cleanName = stripHtml(product.name);
  const cleanDescription = stripHtml(product.short_description || product.description);
  const price = product.sale_price || product.price || "2499";
  const inStock = product.stock_status === "instock";

  // Only include aggregateRating if real approved reviews exist!
  const hasApprovedReviews = reviews.length > 0 && product.rating_count > 0;
  const aggregateRating = hasApprovedReviews
    ? {
        "@type": "AggregateRating",
        ratingValue: product.average_rating || "5.0",
        reviewCount: product.rating_count,
        bestRating: "5",
        worstRating: "1",
      }
    : undefined;

  // Real review items if present
  const reviewSchema = hasApprovedReviews
    ? reviews.slice(0, 5).map((rev) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: rev.reviewer,
        },
        datePublished: rev.date_created,
        reviewBody: stripHtml(rev.review),
        reviewRating: {
          "@type": "Rating",
          ratingValue: rev.rating,
          bestRating: "5",
          worstRating: "1",
        },
      }))
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${BASE_URL}/fire-safety-kit/#product`,
    name: cleanName,
    description: cleanDescription,
    image: product.images.map((img: { src: string }) => img.src),
    sku: product.sku || `GK-${product.id}`,
    brand: {
      "@type": "Brand",
      name: "Graha Kavach",
    },
    offers: {
      "@type": "Offer",
      url: `${BASE_URL}/fire-safety-kit`,
      priceCurrency: "INR",
      price: price,
      priceValidUntil: "2027-12-31",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Speciality Geochem",
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
      },
    },
    aggregateRating,
    review: reviewSchema,
  };
}

export function buildArticleSchema({
  title,
  excerpt,
  slug,
  date,
  modified,
  image,
}: {
  title: string;
  excerpt?: string;
  slug: string;
  date: string;
  modified?: string;
  image?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${BASE_URL}/blog/${slug}/#article`,
    headline: stripHtml(title),
    description: stripHtml(excerpt || title),
    datePublished: date,
    dateModified: modified || date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/blog/${slug}`,
    },
    author: {
      "@type": "Organization",
      name: "Graha Kavach Fire Safety Team",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Graha Kavach",
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    image: image || undefined,
  };
}

export function buildFaqSchema(faqs: Array<{ q: string; a: string }>) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: stripHtml(faq.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: stripHtml(faq.a),
      },
    })),
  };
}
