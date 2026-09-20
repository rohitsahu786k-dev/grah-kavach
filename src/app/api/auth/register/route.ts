import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/session";
import { wooRequest } from "@/lib/woocommerce/client";

const registerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().trim().optional().default(""),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = registerSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { firstName, lastName, email, password, phone } = parsed.data;

    // Create customer in WooCommerce
    const newCustomer = await wooRequest<{
      id: number;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
      role: string;
      billing: Record<string, string>;
      shipping: Record<string, string>;
    }>({
      path: "/customers",
      method: "POST",
      body: {
        email,
        first_name: firstName,
        last_name: lastName,
        username: email,
        password,
        billing: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
        },
        shipping: {
          first_name: firstName,
          last_name: lastName,
        },
      },
      revalidate: false,
    });

    // Set secure HTTP-only session cookie
    await setSessionCookie({
      customerId: newCustomer.id,
      email: newCustomer.email,
      username: newCustomer.username,
      firstName: newCustomer.first_name || firstName,
      lastName: newCustomer.last_name || lastName,
      roles: [newCustomer.role || "customer"],
    });

    return NextResponse.json({
      success: true,
      customer: {
        customerId: newCustomer.id,
        email: newCustomer.email,
        username: newCustomer.username,
        firstName: newCustomer.first_name || firstName,
        lastName: newCustomer.last_name || lastName,
        roles: [newCustomer.role || "customer"],
        billing: newCustomer.billing,
        shipping: newCustomer.shipping,
      },
    });
  } catch (error) {
    const errorStr = String(error);
    const friendlyError = errorStr.includes("email_exists") || errorStr.includes("already registered")
      ? "An account with this email address already exists. Please login instead."
      : "Failed to register account. Please try again.";

    return NextResponse.json(
      { error: friendlyError, details: errorStr },
      { status: 400 },
    );
  }
}
