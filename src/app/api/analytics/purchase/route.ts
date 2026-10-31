import { NextResponse } from "next/server";
import { z } from "zod";
import { wooRequest } from "@/lib/woocommerce/client";
import {
  GADS_TRACKED_META,
  alreadyReported,
  isPaidOnline,
  type PurchaseCheckOrder,
} from "@/lib/analytics/purchase-verify";

const bodySchema = z.object({
  orderId: z.number().int().positive(),
  key: z.string().min(1),
});

/**
 * Releases the Google Ads purchase event for one order, once.
 *
 * The browser only knows an order id and key, which prove nothing about
 * payment, so the order is read from WooCommerce here. The answer is
 * `fire: true` only if the order is genuinely paid online and no earlier
 * request has already claimed it. The claim is stored on the order itself,
 * so refreshes, other devices and a reopened confirmation link all get false.
 */
export async function POST(request: Request) {
  try {
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ fire: false }, { status: 400 });
    const { orderId, key } = parsed.data;

    const order = await wooRequest<PurchaseCheckOrder>({ path: `/orders/${orderId}`, revalidate: false });
    if (order.order_key !== key) return NextResponse.json({ fire: false }, { status: 403 });

    if (!isPaidOnline(order) || alreadyReported(order)) return NextResponse.json({ fire: false });

    const value = Number.parseFloat(order.total);
    if (!Number.isFinite(value) || value <= 0) return NextResponse.json({ fire: false });

    // Claim before answering: if this write fails, nothing is fired.
    await wooRequest({
      path: `/orders/${orderId}`,
      method: "PUT",
      body: { meta_data: [{ key: GADS_TRACKED_META, value: new Date().toISOString() }] },
      revalidate: false,
    });

    return NextResponse.json({
      fire: true,
      transaction_id: String(order.id),
      value,
      currency: order.currency || "INR",
    });
  } catch {
    return NextResponse.json({ fire: false }, { status: 500 });
  }
}
