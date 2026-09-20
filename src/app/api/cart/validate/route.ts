import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCartServer } from "@/lib/woocommerce/cart-server";

const validateRequestSchema = z.object({
  items: z.array(
    z.object({
      productId: z.number().int().positive(),
      quantity: z.number().int().positive(),
    }),
  ),
  couponCode: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = validateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid cart payload", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const validated = await validateCartServer(
      parsed.data.items,
      parsed.data.couponCode,
    );

    return NextResponse.json(validated);
  } catch (error) {
    return NextResponse.json(
      { error: "Cart validation failed", details: String(error) },
      { status: 500 },
    );
  }
}
