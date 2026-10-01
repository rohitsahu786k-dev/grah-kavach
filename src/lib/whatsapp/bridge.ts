import "server-only";

import { createHmac } from "node:crypto";
import { serverEnv } from "@/lib/env";

/**
 * Signed server-to-server calls to the WhatsApp plugin on the WordPress backend.
 *
 * The body carries a timestamp and is signed with the same shared secret the
 * revalidation webhook already uses, so no new configuration is needed. The
 * plugin rejects unsigned or stale requests.
 */
export function isWhatsAppBridgeConfigured() {
  return serverEnv().REVALIDATION_SECRET !== "";
}

export async function postToWhatsAppPlugin<T>(
  path: string,
  payload: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T | null }> {
  const env = serverEnv();
  if (!env.REVALIDATION_SECRET) return { ok: false, status: 503, data: null };

  const body = JSON.stringify({ ...payload, timestamp: Math.floor(Date.now() / 1000) });
  const signature = createHmac("sha256", env.REVALIDATION_SECRET).update(body).digest("hex");
  const url = `${env.WORDPRESS_URL.replace(/\/$/, "")}/wp-json/gk-whatsapp/v1${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-gk-signature": `sha256=${signature}` },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    const data = (await response.json().catch(() => null)) as T | null;
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}
