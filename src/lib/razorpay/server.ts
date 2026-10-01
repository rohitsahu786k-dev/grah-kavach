import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { serverEnv } from "@/lib/env";

const API = "https://api.razorpay.com/v1";

export type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt: string | null;
  status: string;
  notes: Record<string, string> | unknown[];
};

export function isRazorpayConfigured() {
  const env = serverEnv();
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId() {
  return serverEnv().RAZORPAY_KEY_ID;
}

async function razorpayRequest<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown }) {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = serverEnv();
  const response = await fetch(`${API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString("base64")}`,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay responded ${response.status}`);
  }

  return (await response.json()) as T;
}

/** Creates the Razorpay order the checkout popup pays against. Amount is in paise. */
export function createRazorpayOrder(input: {
  amountMinor: number;
  currency: string;
  receipt: string;
  wooOrderId: number;
}) {
  return razorpayRequest<RazorpayOrder>("/orders", {
    method: "POST",
    body: {
      amount: input.amountMinor,
      currency: input.currency,
      receipt: input.receipt,
      notes: {
        woocommerce_order_number: String(input.wooOrderId),
        woocommerce_order_id: String(input.wooOrderId),
      },
    },
  });
}

export function fetchRazorpayOrder(id: string) {
  return razorpayRequest<RazorpayOrder>(`/orders/${encodeURIComponent(id)}`);
}

export function fetchRazorpayPayment(id: string) {
  return razorpayRequest<Record<string, unknown>>(`/payments/${encodeURIComponent(id)}`);
}

/** Checks the signature Razorpay returns to the browser after a successful payment. */
export function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const expected = createHmac("sha256", serverEnv().RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
