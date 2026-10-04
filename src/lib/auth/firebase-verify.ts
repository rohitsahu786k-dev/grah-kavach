import "server-only";

import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "grahakavach-60438";

// Firebase signs ID tokens with rotating Google keys; jose caches and refreshes them.
const jwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

/** Verifies a Firebase ID token and returns the verified phone number (E.164), or null. */
export async function verifyFirebasePhoneToken(idToken: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(idToken, jwks, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    const phone = payload.phone_number;
    return typeof phone === "string" && /^\+\d{8,15}$/.test(phone) ? phone : null;
  } catch {
    return null;
  }
}
