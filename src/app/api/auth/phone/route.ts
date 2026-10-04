import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/session";
import { verifyFirebasePhoneToken } from "@/lib/auth/firebase-verify";
import { wooRequest } from "@/lib/woocommerce/client";

const bodySchema = z.object({ idToken: z.string().min(20) });

type WooCustomerRecord = {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: string;
  billing: Record<string, string>;
  shipping: Record<string, string>;
};

/**
 * Phone-number login. The browser completes Firebase OTP verification and sends
 * the resulting ID token here; we verify it against Google's keys, then find or
 * create the matching WooCommerce customer and start the usual session cookie.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const e164 = await verifyFirebasePhoneToken(parsed.data.idToken);
    if (!e164) {
      return NextResponse.json({ error: "Phone verification failed. Please try again." }, { status: 401 });
    }

    const digits = e164.slice(1); // e.g. 919876543210
    const national = digits.startsWith("91") ? digits.slice(2) : digits;
    // Phone-only accounts get a deterministic placeholder email, so the same
    // number always maps to the same WooCommerce customer.
    const email = `${digits}@phone.grahakavach.in`;

    const existing = await wooRequest<WooCustomerRecord[]>({
      path: "/customers",
      query: { email },
      revalidate: false,
    });

    let customer = existing[0];
    if (!customer) {
      customer = await wooRequest<WooCustomerRecord>({
        path: "/customers",
        method: "POST",
        body: {
          email,
          username: `u${digits}`,
          password: randomBytes(24).toString("base64url"),
          billing: { phone: national, email },
        },
        revalidate: false,
      });
    }

    const profile = {
      customerId: customer.id,
      email: customer.email,
      username: customer.username,
      firstName: customer.first_name || "",
      lastName: customer.last_name || "",
      roles: [customer.role || "customer"],
    };

    await setSessionCookie(profile);

    return NextResponse.json({
      success: true,
      customer: {
        ...profile,
        billing: { ...(customer.billing || {}), phone: customer.billing?.phone || national },
        shipping: customer.shipping || {},
      },
    });
  } catch {
    return NextResponse.json({ error: "Login service unavailable. Please try again." }, { status: 500 });
  }
}
