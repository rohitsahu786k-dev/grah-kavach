import "server-only";

import { z } from "zod";
import { DataError } from "@/lib/errors";
import { hasWooCredentials, serverEnv } from "@/lib/env";

type WooRequestOptions<T> = {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  tags?: string[];
  revalidate?: number | false;
  schema?: z.ZodType<T>;
};

function wooRestUrl(path: string, query: Record<string, string | number | boolean | undefined> = {}) {
  const env = serverEnv();
  const normalizedBase = env.WOOCOMMERCE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBase}/wp-json/wc/v3${normalizedPath}`);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }

  return url.toString();
}

export function getWooCommerceUrls() {
  const base = serverEnv().WOOCOMMERCE_URL.replace(/\/$/, "");

  return {
    base,
    account: `${base}/my-account/`,
    cart: `${base}/cart/`,
    checkout: `${base}/checkout/`,
  } as const;
}

export async function wooRequest<T>({
  path,
  method = "GET",
  query,
  body,
  tags = [],
  revalidate = false,
  schema,
}: WooRequestOptions<T>): Promise<T> {
  if (!hasWooCredentials()) {
    throw new DataError("unauthorized", "woocommerce", "WooCommerce REST credentials are not configured.");
  }

  const env = serverEnv();
  const credentials = Buffer.from(`${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`).toString("base64");

  let response: Response;

  try {
    response = await fetch(wooRestUrl(path, query), {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${credentials}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: revalidate === false ? "no-store" : undefined,
      next: revalidate === false ? undefined : { revalidate, tags },
    });
  } catch (error) {
    throw new DataError("unavailable", "woocommerce", `WooCommerce is unavailable: ${String(error)}`);
  }

  if (!response.ok) {
    const kind =
      response.status === 401 || response.status === 403
        ? "unauthorized"
        : response.status === 404
          ? "not_found"
          : "unavailable";

    throw new DataError(kind, "woocommerce", `WooCommerce REST failed with ${response.status}`, response.status);
  }

  const payload = (await response.json()) as T;

  if (!schema) return payload;

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw new DataError(
      "malformed",
      "woocommerce",
      `WooCommerce REST response shape changed: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}
