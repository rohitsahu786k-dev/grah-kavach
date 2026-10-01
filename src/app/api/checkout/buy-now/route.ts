import { NextResponse } from "next/server";
import { z } from "zod";
import { wooRequest } from "@/lib/woocommerce/client";
import {
  createRazorpayOrder,
  isRazorpayConfigured,
  razorpayKeyId,
} from "@/lib/razorpay/server";

const bodySchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().default(1),
});

type WooProduct = {
  id: number;
  name: string;
  price: string;
  status: string;
  stock_status: string;
};

export async function POST(request: Request) {
  try {
    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Online payment gateway is temporarily unavailable." },
        { status: 503 },
      );
    }

    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid product or quantity." }, { status: 400 });
    }

    const { productId, quantity } = parsed.data;

    // Verify product exists and is purchasable
    const product = await wooRequest<WooProduct>({
      path: `/products/${productId}`,
      revalidate: 60,
    }).catch(() => null);

    if (!product || product.stock_status === "outofstock") {
      return NextResponse.json(
        { error: "Product is currently out of stock or unavailable." },
        { status: 400 },
      );
    }

    // Create pending WooCommerce Order for instant buy
    const orderPayload = {
      payment_method: "razorpay",
      payment_method_title: "Razorpay (UPI, Cards, Magic Checkout)",
      set_paid: false,
      status: "pending",
      billing: {
        first_name: "Customer",
        last_name: "",
        country: "IN",
      },
      shipping: {
        first_name: "Customer",
        last_name: "",
        country: "IN",
      },
      line_items: [
        {
          product_id: productId,
          quantity,
        },
      ],
      meta_data: [
        { key: "_source", value: "buy-now-magic-checkout" },
      ],
    };

    const wooOrder = await wooRequest<{
      id: number;
      number: string;
      order_key: string;
      status: string;
      total: string;
      currency: string;
    }>({
      path: "/orders",
      method: "POST",
      body: orderPayload,
      revalidate: false,
    });

    const totalMinor = Math.round(parseFloat(wooOrder.total) * 100);

    const rzpOrder = await createRazorpayOrder({
      amountMinor: totalMinor,
      currency: wooOrder.currency || "INR",
      receipt: String(wooOrder.id),
      wooOrderId: wooOrder.id,
    });

    return NextResponse.json({
      success: true,
      orderId: wooOrder.id,
      orderNumber: wooOrder.number || String(wooOrder.id),
      orderKey: wooOrder.order_key,
      productName: product.name,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      razorpay: {
        keyId: razorpayKeyId(),
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
      },
    });
  } catch (error) {
    console.error("Buy now endpoint error:", error);
    return NextResponse.json(
      { error: "Could not initialize quick checkout.", details: String(error) },
      { status: 500 },
    );
  }
}
