/**
 * Cache tags and lifetimes.
 *
 * Tags are the contract between WordPress and Next.js: the WordPress plugin
 * (`grahakavach-headless-core`) emits exactly these strings on save, and the
 * revalidation route feeds them to `revalidateTag`. Keep both sides in step —
 * see docs/ARCHITECTURE.md §8.
 */

export const CacheTag = {
  settings: "wp-settings",
  posts: "wp-posts",
  post: (slug: string) => `wp-post:${slug}`,
  page: (slug: string) => `wp-page:${slug}`,
  /** The list of published pages, which drives the CMS page routes. */
  pages: "wp-pages",
  faqs: "wp-gk_faq",
  safetyGuides: "wp-gk_safety_guide",
  certifications: "wp-gk_certification",
  testimonials: "wp-gk_testimonial",
  kitItems: "wp-gk_kit_item",
  products: "woo-products",
  product: (id: number | string) => `woo-product:${id}`,
} as const;

/**
 * Revalidation windows, in seconds.
 *
 * Editorial content tolerates being an hour stale. Commerce does not: a price
 * or stock figure that is wrong on screen is worse than a slow page, so those
 * are short-lived, and anything that is per-customer or transactional is never
 * cached at all.
 */
export const Revalidate = {
  /** Settings, navigation, legal copy. */
  settings: 3600,
  /** Pages and posts. */
  content: 3600,
  /** Product catalogue: name, description, images. */
  catalogue: 300,
  /** Price and stock. Short, because showing a stale price is a real problem. */
  pricing: 60,
  /** Never cached: cart, coupon validation, orders, tracking. */
  never: 0,
} as const;
