import { NextResponse } from "next/server";
import { z } from "zod";
import { wooRequest } from "@/lib/woocommerce/client";
import {
  fetchRazorpayOrder,
  isRazorpayConfigured,
  verifyPaymentSignature,
} from "@/lib/razorpay/server";

const bodySchema = z.object({
  wooOrderId: z.number().int().positive(),
  orderKey: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

type WooOrder = { id: number; order_key: string; status: string; total: string };

export async function POST(request: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 503 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payment confirmation." }, { status: 400 });
    }

    const { wooOrderId, orderKey, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      return NextResponse.json({ error: "Payment signature could not be verified." }, { status: 400 });
    }

    const order = await wooRequest<WooOrder>({ path: `/orders/${wooOrderId}`, revalidate: false });
    if (order.order_key !== orderKey) {
      return NextResponse.json({ error: "Order key mismatch." }, { status: 403 });
    }

    // The signature proves this payment belongs to *a* Razorpay order. Make sure
    // that order is the one created for this Woo order, for the full amount.
    const rzpOrder = await fetchRazorpayOrder(razorpay_order_id);
    const expectedAmount = Math.round(parseFloat(order.total) * 100);
    if (rzpOrder.receipt !== String(wooOrderId) || rzpOrder.amount !== expectedAmount) {
      return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
    }

    if (order.status === "pending" || order.status === "failed" || order.status === "on-hold") {
      await wooRequest({
        path: `/orders/${wooOrderId}`,
        method: "PUT",
        body: {
          set_paid: true,
          transaction_id: razorpay_payment_id,
          meta_data: [
            { key: "razorpay_payment_id", value: razorpay_payment_id },
            { key: "razorpay_order_id", value: razorpay_order_id },
          ],
        },
        revalidate: false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not confirm the payment.", details: String(error) },
      { status: 500 },
    );
  }
}
