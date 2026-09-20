import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import { stripHtml } from "@/lib/wordpress/format";

export interface YoastSeoData {
  title?: string | null;
  metaDesc?: string | null;
  canonical?: string | null;
  metaRobotsNoindex?: string | null;
  metaRobotsNofollow?: string | null;
  opengraphTitle?: string | null;
  opengraphDescription?: string | null;
  opengraphImage?: {
    sourceUrl?: string | null;
  } | null;
}

interface BuildSeoOptions {
  seo?: YoastSeoData | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  fallbackImage?: string | null;
}

/**
 * Sanitizes any canonical URL:
 * - Rewrites backend admin domain to public storefront domain
 * - Guarantees https://grahakavach.in/<path>
 */
export function sanitizeCanonicalUrl(rawUrl?: string | null, fallbackPath = "/"): string {
  const publicBase = siteConfig.frontendUrl.replace(/\/$/, "");
  const normalizedFallback = fallbackPath.startsWith("/") ? fallbackPath : `/${fallbackPath}`;

  if (!rawUrl || rawUrl.trim() === "") {
    return `${publicBase}${normalizedFallback === "/" ? "" : normalizedFallback}`;
  }

  try {
    let clean = rawUrl.trim();

    // Replace admin domain if leaked
    clean = clean.replace(/https?:\/\/admin\.grahakavach\.in/g, publicBase);

    // If it's a relative path
    if (clean.startsWith("/")) {
      return `${publicBase}${clean === "/" ? "" : clean}`;
    }

    const parsed = new URL(clean);
    // Force public hostname
    parsed.protocol = "https:";
    parsed.host = new URL(publicBase).host;
    return parsed.toString();
  } catch {
    return `${publicBase}${normalizedFallback === "/" ? "" : normalizedFallback}`;
  }
}

/**
 * Constructs a Next.js Metadata object from Yoast SEO data with robust fallbacks
 */
export function buildSeoMetadata({
  seo,
  fallbackTitle,
  fallbackDescription,
  path,
  fallbackImage,
}: BuildSeoOptions): Metadata {
  const cleanFallbackTitle = stripHtml(fallbackTitle);
  const cleanFallbackDesc = stripHtml(fallbackDescription);

  const title = seo?.title ? stripHtml(seo.title) : cleanFallbackTitle;
  const description = seo?.metaDesc && seo.metaDesc.trim().length > 0
    ? stripHtml(seo.metaDesc)
    : cleanFallbackDesc;

  const canonical = sanitizeCanonicalUrl(seo?.canonical, path);

  const ogTitle = seo?.opengraphTitle ? stripHtml(seo.opengraphTitle) : title;
  const ogDescription = seo?.opengraphDescription && seo.opengraphDescription.trim().length > 0
    ? stripHtml(seo.opengraphDescription)
    : description;

  const ogImageUrl = seo?.opengraphImage?.sourceUrl || fallbackImage;

  // On the public frontend, index unless Yoast explicitly marked this post as noindex
  const isNoindex = seo?.metaRobotsNoindex === "noindex";
  const isNofollow = seo?.metaRobotsNofollow === "nofollow";

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: {
      index: !isNoindex,
      follow: !isNofollow,
      googleBot: {
        index: !isNoindex,
        follow: !isNofollow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: "Graha Kavach",
      type: "website",
      images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}
