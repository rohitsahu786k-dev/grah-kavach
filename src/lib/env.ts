import { z } from "zod";

/**
 * Environment contract.
 *
 * Only `NEXT_PUBLIC_SITE_URL` is public. Everything else — including the
 * WordPress and WooCommerce origins — is server-only, because `NEXT_PUBLIC_*`
 * values are inlined into the browser bundle at build time and cannot be
 * revoked without a redeploy. The backend origin is not a secret, but it also
 * does not need to be advertised in page source.
 *
 * `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` must never appear in a
 * `NEXT_PUBLIC_*` name. They are read exclusively through `serverEnv()`, which
 * is guarded by `server-only`.
 */

const url = z.string().url();

const publicSchema = z.object({
  NEXT_PUBLIC_SITE_URL: url.default("https://grahakavach.in"),
});

const serverSchema = z.object({
  WORDPRESS_URL: url.default("https://admin.grahakavach.in"),
  WORDPRESS_GRAPHQL_URL: url.default("https://admin.grahakavach.in/graphql"),
  WOOCOMMERCE_URL: url.default("https://admin.grahakavach.in"),
  WC_CONSUMER_KEY: z.string().default(""),
  WC_CONSUMER_SECRET: z.string().default(""),
  REVALIDATION_SECRET: z.string().default(""),
});

export const publicEnv = publicSchema.parse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

let cachedServerEnv: z.infer<typeof serverSchema> | null = null;

/** Server-only environment. Throws if a value is malformed rather than guessing. */
export function serverEnv() {
  if (cachedServerEnv) return cachedServerEnv;

  cachedServerEnv = serverSchema.parse({
    WORDPRESS_URL: process.env.WORDPRESS_URL,
    WORDPRESS_GRAPHQL_URL: process.env.WORDPRESS_GRAPHQL_URL,
    WOOCOMMERCE_URL: process.env.WOOCOMMERCE_URL,
    WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY ?? process.env.WOO_CONSUMER_KEY,
    WC_CONSUMER_SECRET:
      process.env.WC_CONSUMER_SECRET ?? process.env.WOO_CONSUMER_SECRET,
    REVALIDATION_SECRET:
      process.env.REVALIDATION_SECRET ?? process.env.REVALIDATE_SECRET,
  });

  return cachedServerEnv;
}

/** True when WooCommerce REST credentials are configured. */
export function hasWooCredentials(): boolean {
  const env = serverEnv();
  return env.WC_CONSUMER_KEY !== "" && env.WC_CONSUMER_SECRET !== "";
}
