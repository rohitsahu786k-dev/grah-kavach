import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCustomer } from "@/lib/auth/session";
import { indianAddressSchema } from "@/lib/validation/checkout";
import { wooRequest } from "@/lib/woocommerce/client";

const updateAddressSchema = z.object({
  type: z.enum(["billing", "shipping"]),
  address: indianAddressSchema,
});

export async function PUT(request: Request) {
  try {
    const session = await getSessionCustomer();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = updateAddressSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { type, address } = parsed.data;

    const payload = {
      [type]: {
        first_name: address.firstName,
        last_name: address.lastName,
        address_1: address.address1,
        address_2: address.address2 || "",
        city: address.city,
        state: address.state,
        postcode: address.postcode,
        country: "IN",
        ...(type === "billing" ? { email: address.email, phone: address.phone } : {}),
      },
    };

    const updatedCustomer = await wooRequest<{
      id: number;
      billing: Record<string, string>;
      shipping: Record<string, string>;
    }>({
      path: `/customers/${session.customerId}`,
      method: "PUT",
      body: payload,
      revalidate: false,
    });

    return NextResponse.json({
      success: true,
      billing: updatedCustomer.billing,
      shipping: updatedCustomer.shipping,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update address", details: String(error) },
      { status: 500 },
    );
  }
}
