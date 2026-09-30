import { NextResponse } from "next/server";
import { COD_ADVANCE_MINOR } from "@/lib/config/checkout";
import { isRazorpayConfigured } from "@/lib/razorpay/server";
import { getActivePaymentGateways } from "@/lib/woocommerce/payment-gateways";

export async function GET() {
  try {
    const methods = await getActivePaymentGateways();
    return NextResponse.json({
      methods,
      // COD orders take a small advance online when Razorpay is available.
      codAdvanceMinor: isRazorpayConfigured() ? COD_ADVANCE_MINOR : 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load payment methods", details: String(error) },
      { status: 500 },
    );
  }
}
