import { NextResponse } from "next/server";
import { z } from "zod";
import {
  sendMetaCapiEvent,
  extractClientContext,
} from "@/lib/analytics/meta-capi";

const capiRequestSchema = z.object({
  eventName: z.string().min(1),
  eventId: z.string().optional(),
  eventSourceUrl: z.string().url().optional(),
  userData: z
    .object({
      email: z.string().optional(),
      phone: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postcode: z.string().optional(),
      country: z.string().optional(),
    })
    .default({}),
  customData: z.record(z.string(), z.unknown()).optional(),
});

/** Browser-originated events only; keeps the public endpoint from being used for arbitrary events. */
const ALLOWED_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "AddToCart",
  "InitiateCheckout",
  "AddPaymentInfo",
  "Contact",
  "Lead",
]);

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = capiRequestSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid CAPI payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { clientIp, clientUserAgent, fbp, fbc } = extractClientContext(request);
    const { eventName, eventId, eventSourceUrl, userData, customData } =
      parsed.data;

    // Purchase is sent by the checkout routes with verified order data.
    if (!ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ error: "Event not allowed" }, { status: 400 });
    }

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || request.headers.get("referer") || undefined,
      userData: {
        ...userData,
        clientIp,
        clientUserAgent,
        fbp,
        fbc,
      },
      customData,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal CAPI error", details: String(error) },
      { status: 500 },
    );
  }
}
