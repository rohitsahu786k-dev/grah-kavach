import { NextResponse } from "next/server";
import { z } from "zod";
import { COD_ADVANCE_MINOR, isCodMethod } from "@/lib/config/checkout";
import { wooRequest } from "@/lib/woocommerce/client";
import {
  fetchRazorpayOrder,
  fetchRazorpayPayment,
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

type WooOrder = {
  id: number;
  order_key: string;
  status: string;
  total: string;
  payment_method: string;
};

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
    const totalMinor = Math.round(parseFloat(order.total) * 100);
    const isCodAdvance = isCodMethod(order.payment_method);
    const expectedAmount = isCodAdvance ? Math.min(COD_ADVANCE_MINOR, totalMinor) : totalMinor;
    if (rzpOrder.receipt !== String(wooOrderId) || rzpOrder.amount !== expectedAmount) {
      return NextResponse.json({ error: "Payment does not match this order." }, { status: 400 });
    }

    if (isCodAdvance && order.status === "pending") {
      // Advance received: the order is confirmed, the balance is collected on delivery.
      const balance = ((totalMinor - expectedAmount) / 100).toFixed(2);
      await wooRequest({
        path: `/orders/${wooOrderId}`,
        method: "PUT",
        body: {
          status: "processing",
          transaction_id: razorpay_payment_id,
          meta_data: [
            { key: "_cod_advance_paid", value: (expectedAmount / 100).toFixed(2) },
            { key: "razorpay_payment_id", value: razorpay_payment_id },
            { key: "razorpay_order_id", value: razorpay_order_id },
          ],
        },
        revalidate: false,
      });
      await wooRequest({
        path: `/orders/${wooOrderId}/notes`,
        method: "POST",
        body: {
          note: `COD advance of ₹${(expectedAmount / 100).toFixed(2)} paid via Razorpay (${razorpay_payment_id}). Collect balance ₹${balance} on delivery.`,
          customer_note: false,
        },
        revalidate: false,
      });
    } else if (
      !isCodAdvance &&
      (order.status === "pending" || order.status === "failed" || order.status === "on-hold")
    ) {
      const paymentDetails = await fetchRazorpayPayment(razorpay_payment_id).catch(() => null);
      const updateBody: Record<string, unknown> = {
        set_paid: true,
        status: "processing",
        transaction_id: razorpay_payment_id,
        meta_data: [
          { key: "razorpay_payment_id", value: razorpay_payment_id },
          { key: "razorpay_order_id", value: razorpay_order_id },
        ],
      };

      if (paymentDetails) {
        const contact = typeof paymentDetails.contact === "string" ? paymentDetails.contact : "";
        const email = typeof paymentDetails.email === "string" ? paymentDetails.email : "";
        if (contact || email) {
          updateBody.billing = {
            ...(contact ? { phone: contact } : {}),
            ...(email ? { email } : {}),
          };
        }
      }

      await wooRequest({
        path: `/orders/${wooOrderId}`,
        method: "PUT",
        body: updateBody,
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
