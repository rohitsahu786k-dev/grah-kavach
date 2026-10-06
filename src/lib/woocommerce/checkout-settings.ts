import "server-only";

import { z } from "zod";
import { serverEnv } from "@/lib/env";
import { DEFAULT_COD_ADVANCE, type CodAdvanceConfig } from "@/lib/config/checkout";

const responseSchema = z.object({
  enabled: z.boolean(),
  type: z.enum(["fixed", "percent"]),
  value: z.number().nonnegative(),
});

/**
 * The COD advance configured in WordPress (Deposits & Partial Payments),
 * through the headless-core plugin's `gk/v1/checkout-settings` route.
 * Cached briefly so a price change in wp-admin shows up within a minute.
 */
export async function getCodAdvanceConfig(): Promise<CodAdvanceConfig> {
  try {
    const base = serverEnv().WORDPRESS_URL.replace(/\/$/, "");
    const res = await fetch(`${base}/wp-json/gk/v1/checkout-settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return DEFAULT_COD_ADVANCE;
    const parsed = responseSchema.safeParse(await res.json());
    return parsed.success ? parsed.data : DEFAULT_COD_ADVANCE;
  } catch {
    return DEFAULT_COD_ADVANCE;
  }
}
