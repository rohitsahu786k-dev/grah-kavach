import { NextResponse } from "next/server";
import { z } from "zod";
import { postToWhatsAppPlugin } from "@/lib/whatsapp/bridge";

const recoverSchema = z.object({ token: z.string().regex(/^[a-f0-9]{32}$/i) });

type RecoverResponse = {
  ok: boolean;
  items?: { productId: number; quantity: number }[];
  name?: string;
  phone?: string;
  email?: string;
};

/** Resolves the one-click link in a cart reminder back to the saved cart. */
export async function POST(request: Request) {
  const parsed = recoverSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const result = await postToWhatsAppPlugin<RecoverResponse>("/cart/recover", {
    token: parsed.data.token.toLowerCase(),
  });

  if (!result.ok || !result.data?.items?.length) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    items: result.data.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    name: result.data.name ?? "",
    phone: result.data.phone ?? "",
    email: result.data.email ?? "",
  });
}
