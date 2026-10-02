import "server-only";

import { z } from "zod";
import { CacheTag, Revalidate } from "@/lib/cache";
import { DataError } from "@/lib/errors";
import { serverEnv } from "@/lib/env";

type GraphQlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

type WpGraphqlOptions<T> = {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number | false;
  schema?: z.ZodType<T>;
};

export async function wpGraphql<T>({
  query,
  variables,
  tags = [CacheTag.settings],
  revalidate = Revalidate.content,
  schema,
}: WpGraphqlOptions<T>): Promise<T> {
  const { WORDPRESS_GRAPHQL_URL } = serverEnv();

  let response: Response | null = null;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetch(WORDPRESS_GRAPHQL_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate, tags },
      });

      if (response.ok || (response.status !== 500 && response.status !== 502 && response.status !== 503 && response.status !== 504)) {
        break;
      }
      // Transient 5xx error, wait and retry
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
      }
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
      }
    }
  }

  if (!response) {
    throw new DataError(
      "unavailable",
      "wordpress",
      `WordPress GraphQL is unavailable: ${String(lastError)}`,
    );
  }

  if (!response.ok) {
    throw new DataError(
      response.status === 404 ? "not_found" : "unavailable",
      "wordpress",
      `WordPress GraphQL failed with ${response.status}`,
      response.status,
    );
  }

  const payload = (await response.json()) as GraphQlResponse<T>;

  if (payload.errors?.length) {
    throw new DataError(
      "malformed",
      "wordpress",
      payload.errors.map((error) => error.message).join("; "),
      response.status,
    );
  }

  if (!payload.data) {
    throw new DataError("malformed", "wordpress", "WordPress GraphQL returned no data");
  }

  if (!schema) return payload.data;

  const parsed = schema.safeParse(payload.data);

  if (!parsed.success) {
    throw new DataError(
      "malformed",
      "wordpress",
      `WordPress GraphQL response shape changed: ${parsed.error.message}`,
    );
  }

  return parsed.data;
}
