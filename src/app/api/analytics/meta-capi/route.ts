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

    const { clientIp, clientUserAgent } = extractClientContext(request);
    const { eventName, eventId, eventSourceUrl, userData, customData } =
      parsed.data;

    const result = await sendMetaCapiEvent({
      eventName,
      eventId,
      eventSourceUrl: eventSourceUrl || request.headers.get("referer") || undefined,
      userData: {
        ...userData,
        clientIp,
        clientUserAgent,
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
