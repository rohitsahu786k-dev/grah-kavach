import { NextResponse } from "next/server";
import { getActivePaymentGateways } from "@/lib/woocommerce/payment-gateways";

export async function GET() {
  try {
    const methods = await getActivePaymentGateways();
    return NextResponse.json({ methods });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load payment methods", details: String(error) },
      { status: 500 },
    );
  }
}
