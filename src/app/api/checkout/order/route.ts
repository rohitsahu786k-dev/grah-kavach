import { NextResponse } from "next/server";
import { checkoutSubmissionSchema } from "@/lib/validation/checkout";
import { validateCartServer } from "@/lib/woocommerce/cart-server";
import { wooRequest } from "@/lib/woocommerce/client";
import { getActivePaymentGateways } from "@/lib/woocommerce/payment-gateways";
import { COD_FEE_LABEL, COD_FEE_MINOR, isCodMethod } from "@/lib/config/checkout";
import { getWooCommerceUrls } from "@/lib/woocommerce/client";

type IdempotencyEntry = {
  response: {
    success: boolean;
    orderId: number;
    orderNumber: string;
    orderKey: string;
    status: string;
    total: string;
    currency: string;
    isOnline: boolean;
    paymentUrl: string | null;
  };
  timestamp: number;
};

// In-memory idempotency cache (TTL 10 minutes)
const idempotencyStore = new Map<string, IdempotencyEntry>();

function cleanIdempotencyStore() {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (now - value.timestamp > 10 * 60 * 1000) {
      idempotencyStore.delete(key);
    }
  }
}

export async function POST(request: Request) {
  try {
    cleanIdempotencyStore();
    const rawBody = await request.json();
    const parsed = checkoutSubmissionSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { address, paymentMethod, items, couponCode, idempotencyKey } = parsed.data;

    // Check idempotency cache
    const cacheKey = `${idempotencyKey}:${paymentMethod}`;
    const existing = idempotencyStore.get(cacheKey);
    if (existing) {
      return NextResponse.json(existing.response);
    }

    // Server-side validation of live products, prices, stock, and coupon
    const validatedCart = await validateCartServer(items, couponCode);

    if (validatedCart.hasErrors) {
      return NextResponse.json(
        {
          error: "Cart validation failed",
          messages: validatedCart.errorMessages,
          cart: validatedCart,
        },
        { status: 400 },
      );
    }

    if (!validatedCart.items.length) {
      return NextResponse.json(
        { error: "Cannot create an order with an empty cart." },
        { status: 400 },
      );
    }

    // Check payment gateway
    const activeGateways = await getActivePaymentGateways();
    const selectedGateway = activeGateways.find((g) => g.id === paymentMethod);

    if (!selectedGateway) {
      return NextResponse.json(
        {
          error: `Payment method "${paymentMethod}" is not active.`,
        },
        { status: 400 },
      );
    }

    // Determine initial status based on payment method
    // COD is set to 'processing' (or 'on-hold') and unpaid
    const isCod = isCodMethod(selectedGateway.id);
    const initialStatus = isCod ? "processing" : "pending";

    // Construct WooCommerce Order Payload
    const orderPayload = {
      payment_method: selectedGateway.id,
      payment_method_title: selectedGateway.title,
      set_paid: false,
      status: initialStatus,
      billing: {
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company || "",
        address_1: address.address1,
        address_2: address.address2 || "",
        city: address.city,
        state: address.state,
        postcode: address.postcode,
        country: "IN",
        email: address.email,
        phone: address.phone,
      },
      shipping: {
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company || "",
        address_1: address.address1,
        address_2: address.address2 || "",
        city: address.city,
        state: address.state,
        postcode: address.postcode,
        country: "IN",
      },
      line_items: validatedCart.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      fee_lines: isCod
        ? [
            {
              name: COD_FEE_LABEL,
              tax_status: "none",
              total: (COD_FEE_MINOR / 100).toFixed(2),
            },
          ]
        : [],
      coupon_lines: validatedCart.coupon ? [{ code: validatedCart.coupon.code }] : [],
      customer_note: address.orderNotes || "",
      meta_data: [
        { key: "_idempotency_key", value: idempotencyKey },
        { key: "_source", value: "nextjs-headless" },
        ...(address.gstin
          ? [
              { key: "_billing_gstin", value: address.gstin },
              { key: "GSTIN", value: address.gstin },
              { key: "gstin", value: address.gstin },
            ]
          : []),
      ],
    };

    // Create WooCommerce Order
    const wooOrder = await wooRequest<{
      id: number;
      number: string;
      order_key: string;
      status: string;
      total: string;
      currency: string;
      payment_url?: string;
    }>({
      path: "/orders",
      method: "POST",
      body: orderPayload,
      revalidate: false,
    });

    const result = {
      success: true,
      orderId: wooOrder.id,
      orderNumber: wooOrder.number || String(wooOrder.id),
      orderKey: wooOrder.order_key,
      status: wooOrder.status,
      total: wooOrder.total,
      currency: wooOrder.currency,
      isOnline: !isCod && selectedGateway.isOnline,
      // Online gateways (Razorpay) collect payment on WooCommerce's order-pay page.
      paymentUrl:
        !isCod && selectedGateway.isOnline
          ? wooOrder.payment_url ||
            `${getWooCommerceUrls().checkout}order-pay/${wooOrder.id}/?pay_for_order=true&key=${wooOrder.order_key}`
          : null,
    };

    // Cache idempotency response
    idempotencyStore.set(cacheKey, {
      response: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: "Order creation failed", details: String(error) },
      { status: 500 },
    );
  }
}
