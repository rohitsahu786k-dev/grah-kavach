import "server-only";

import { serverEnv } from "@/lib/validation/env";

export function getWooRestConfig() {
  const env = serverEnv();

  return {
    wooRestUrl: `${env.WOOCOMMERCE_URL.replace(/\/$/, "")}/wp-json/wc/v3`,
    consumerKey: env.WC_CONSUMER_KEY,
    consumerSecret: env.WC_CONSUMER_SECRET,
  } as const;
}
