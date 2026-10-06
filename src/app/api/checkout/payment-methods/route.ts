import { NextResponse } from "next/server";
import { getCodAdvanceConfig } from "@/lib/woocommerce/checkout-settings";
import { isRazorpayConfigured } from "@/lib/razorpay/server";
import { getActivePaymentGateways } from "@/lib/woocommerce/payment-gateways";

export async function GET() {
  try {
    const [methods, advance] = await Promise.all([getActivePaymentGateways(), getCodAdvanceConfig()]);
    return NextResponse.json({
      methods,
      // COD orders take an advance online when Razorpay is available and the
      // partial-payment setting in wp-admin is on. Amount is that setting, live.
      codAdvance: isRazorpayConfigured() ? advance : { ...advance, enabled: false },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load payment methods", details: String(error) },
      { status: 500 },
    );
  }
}
