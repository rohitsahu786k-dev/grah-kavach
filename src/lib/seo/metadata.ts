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

const BRAND = "Graha Kavach";
const TITLE_MAX = 60;
const DESC_MIN = 110;
const DESC_MAX = 160;

// Appended (in order) to descriptions that are too short to be useful in search results.
const DESC_FILLERS = [
  "Certified home fire safety by Speciality Geochem, Udaipur.",
  "Delivery across India with COD available.",
];

const BRAND_TAIL = /\s*[|–—-]\s*Graha Kavach(?:™)?\s*$/i;
const TITLE_BREAKS = /\s+[|–—]\s+|\s+-\s+|:\s+|,\s+/g;

/**
 * One brand suffix, at most 60 characters.
 *
 * CMS titles arrive already carrying the brand ("... | Graha Kavach") and the
 * layout template then appended it again. The brand is stripped first, a title
 * that is too long is cut at the last natural break, and the brand is added
 * back exactly once.
 */
export function normalizeTitle(raw: string): string {
  let core = stripHtml(raw).replace(/\s+/g, " ").trim();
  while (BRAND_TAIL.test(core)) core = core.replace(BRAND_TAIL, "").trim();

  if (!core) return BRAND;

  // The title already leads with the brand (the home page): never add it again.
  const suffix = core.toLowerCase().includes(BRAND.toLowerCase()) ? "" : ` | ${BRAND}`;
  const limit = TITLE_MAX - suffix.length;
  if (core.length <= limit) return core + suffix;

  for (const match of [...core.matchAll(TITLE_BREAKS)].reverse()) {
    const head = core.slice(0, match.index).trim();
    if (head.length >= 20 && head.length <= limit) return head + suffix;
  }

  // No usable break: trim on a word boundary.
  const words = core.slice(0, limit + 1).split(" ");
  words.pop();
  const trimmed = words
    .join(" ")
    .replace(/[\s,;:|&-]+$/, "")
    .replace(/\s+(and|or|of|the|for|to|in|a|an|with)$/i, "");

  return (trimmed || core.slice(0, limit)) + suffix;
}

/** 110-160 characters: padded when too short, cut at a sentence or word when too long. */
export function normalizeDescription(raw: string): string {
  let text = stripHtml(raw).replace(/\s+/g, " ").trim();

  for (const filler of DESC_FILLERS) {
    if (text.length >= DESC_MIN) break;
    const already = text.toLowerCase().includes(filler.toLowerCase().slice(0, 25));
    if (!already && text.length + 1 + filler.length <= DESC_MAX) {
      text = `${text}${/[.!?]$/.test(text) ? "" : "."} ${filler}`;
    }
  }

  if (text.length <= DESC_MAX) return text;

  const head = text.slice(0, DESC_MAX);
  const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
  if (sentenceEnd >= DESC_MIN - 10) return head.slice(0, sentenceEnd + 1);

  return `${head.slice(0, head.lastIndexOf(" ")).replace(/[\s,;:-]+$/, "")}…`;
}

interface BuildSeoOptions {
  seo?: YoastSeoData | null;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  fallbackImage?: string | null;
  keywords?: string[] | string;
  /** Keep this URL out of search results (filtered or utility views). */
  noindex?: boolean;
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
  keywords,
  noindex = false,
}: BuildSeoOptions): Metadata {
  const cleanFallbackTitle = stripHtml(fallbackTitle);
  const cleanFallbackDesc = stripHtml(fallbackDescription);

  const title = normalizeTitle(seo?.title ? stripHtml(seo.title) : cleanFallbackTitle);
  const description = normalizeDescription(
    seo?.metaDesc && seo.metaDesc.trim().length > 0 ? stripHtml(seo.metaDesc) : cleanFallbackDesc,
  );

  /*
   * The canonical is always the page's own storefront URL. The CMS canonical is
   * deliberately ignored: WordPress knows a page as /slug/ (or /home/), which on
   * this storefront redirects or 404s, so trusting it made every page
   * "canonical to another page" and pointed that canonical at a dead URL.
   */
  const canonical = sanitizeCanonicalUrl(path.split("?")[0].replace(/(.)\/$/, "$1"), "/");

  const ogTitle = seo?.opengraphTitle ? stripHtml(seo.opengraphTitle) : title;
  const ogDescription = seo?.opengraphDescription && seo.opengraphDescription.trim().length > 0
    ? stripHtml(seo.opengraphDescription)
    : description;

  const publicBase = siteConfig.frontendUrl.replace(/\/$/, "");
  const defaultOgImage = `${publicBase}/brand/graha-kavach-logo.png`;
  const ogImageUrl = seo?.opengraphImage?.sourceUrl || fallbackImage || defaultOgImage;

  // On the public frontend, index unless Yoast explicitly marked this post as noindex
  const isNoindex = noindex || seo?.metaRobotsNoindex === "noindex";
  const isNofollow = seo?.metaRobotsNofollow === "nofollow";

  return {
    // `absolute` skips the layout template, which would add the brand a second time.
    title: { absolute: title },
    description,
    keywords: keywords || [
      "fire safety kit",
      "home fire extinguisher",
      "fire safety ball",
      "fire blanket for kitchen",
      "residential fire safety India",
      "Graha Kavach",
      "Speciality Geochem Udaipur",
    ],
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
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImageUrl],
    },
  };
}
