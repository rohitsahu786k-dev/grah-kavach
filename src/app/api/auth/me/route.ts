import { NextResponse } from "next/server";
import { getSessionCustomer } from "@/lib/auth/session";
import { wooRequest } from "@/lib/woocommerce/client";

export async function GET() {
  try {
    const session = await getSessionCustomer();

    if (!session) {
      return NextResponse.json({ customer: null });
    }

    // Fetch fresh details from WooCommerce
    try {
      const customer = await wooRequest<{
        id: number;
        email: string;
        username: string;
        first_name: string;
        last_name: string;
        role: string;
        billing: Record<string, string>;
        shipping: Record<string, string>;
      }>({
        path: `/customers/${session.customerId}`,
        revalidate: false,
      });

      return NextResponse.json({
        customer: {
          customerId: customer.id,
          email: customer.email,
          username: customer.username,
          firstName: customer.first_name || session.firstName,
          lastName: customer.last_name || session.lastName,
          roles: [customer.role || "customer"],
          billing: customer.billing || {},
          shipping: customer.shipping || {},
        },
      });
    } catch {
      // If customer fetch fails, fall back to session data
      return NextResponse.json({
        customer: {
          customerId: session.customerId,
          email: session.email,
          username: session.username,
          firstName: session.firstName,
          lastName: session.lastName,
          roles: session.roles || ["customer"],
          billing: {},
          shipping: {},
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { customer: null, error: String(error) },
      { status: 500 },
    );
  }
}
