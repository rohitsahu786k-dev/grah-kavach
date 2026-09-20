import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverEnv } from "@/lib/env";

export const SESSION_COOKIE_NAME = "gk_customer_session";
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

export type CustomerSessionData = {
  customerId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  roles?: string[];
  exp: number; // UNIX timestamp in seconds
};

function getAuthSecret(): string {
  const env = serverEnv();
  // Use REVALIDATE_SECRET or WOO consumer secret as reliable high-entropy server secrets
  return env.REVALIDATION_SECRET || env.WC_CONSUMER_SECRET || "gk_default_fallback_session_key_secret";
}

/**
 * Creates an HMAC-SHA256 signed session string.
 * Format: base64(payload).hexSignature
 */
export function signSession(data: Omit<CustomerSessionData, "exp">, maxAgeSeconds = SESSION_MAX_AGE_SECONDS): string {
  const exp = Math.floor(Date.now() / 1000) + maxAgeSeconds;
  const payload: CustomerSessionData = { ...data, exp };
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", getAuthSecret()).update(rawPayload).digest("hex");
  return `${rawPayload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session string using timingSafeEqual.
 */
export function verifySession(token: string): CustomerSessionData | null {
  if (!token || !token.includes(".")) return null;

  const [rawPayload, receivedSignature] = token.split(".");
  if (!rawPayload || !receivedSignature) return null;

  const expectedSignature = createHmac("sha256", getAuthSecret()).update(rawPayload).digest("hex");

  const a = Buffer.from(receivedSignature);
  const b = Buffer.from(expectedSignature);

  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return null; // Tampered token
  }

  try {
    const payload: CustomerSessionData = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf-8"),
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Sets the secure HTTP-only cookie on the outgoing response.
 */
export async function setSessionCookie(data: Omit<CustomerSessionData, "exp">): Promise<void> {
  const cookieStore = await cookies();
  const token = signSession(data);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Reads and verifies the customer session from incoming request cookies.
 */
export async function getSessionCustomer(): Promise<CustomerSessionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  if (!cookie?.value) return null;
  return verifySession(cookie.value);
}
