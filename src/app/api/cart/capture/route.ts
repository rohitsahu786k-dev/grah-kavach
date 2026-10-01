import { NextResponse } from "next/server";
import { z } from "zod";
import { postToWhatsAppPlugin } from "@/lib/whatsapp/bridge";

const captureSchema = z.object({
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/^(\+91|0)/, "").replace(/\D/g, ""))
    .refine((value) => /^[6-9]\d{9}$/.test(value)),
  name: z.string().trim().max(100).optional().default(""),
  email: z.string().trim().max(100).optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive().max(99),
      }),
    )
    .max(20),
});

// A client can only trigger WhatsApp reminders to a number it types in, so keep this tight.
const rateLimit = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (rateLimit.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    rateLimit.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateLimit.set(ip, recent);
  return false;
}

/**
 * Snapshot of the cart for abandoned-cart recovery. Always answers 200 so a
 * backend problem can never surface as an error on the checkout page.
 */
export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown-ip";

  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  const parsed = captureSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const result = await postToWhatsAppPlugin("/cart/capture", parsed.data);
  return NextResponse.json({ ok: result.ok });
}
