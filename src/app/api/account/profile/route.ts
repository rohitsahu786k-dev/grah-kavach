import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCustomer, setSessionCookie } from "@/lib/auth/session";
import { wooRequest } from "@/lib/woocommerce/client";

const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

export async function PUT(request: Request) {
  try {
    const session = await getSessionCustomer();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const raw = await request.json();
    const parsed = updateProfileSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { firstName, lastName, newPassword } = parsed.data;

    const payload: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
    };

    if (newPassword && newPassword.trim()) {
      payload.password = newPassword.trim();
    }

    const updatedCustomer = await wooRequest<{
      id: number;
      email: string;
      username: string;
      first_name: string;
      last_name: string;
    }>({
      path: `/customers/${session.customerId}`,
      method: "PUT",
      body: payload,
      revalidate: false,
    });

    // Re-issue cookie with updated names
    await setSessionCookie({
      customerId: session.customerId,
      email: session.email,
      username: session.username,
      firstName: updatedCustomer.first_name || firstName,
      lastName: updatedCustomer.last_name || lastName,
      roles: session.roles || ["customer"],
    });

    return NextResponse.json({
      success: true,
      customer: {
        firstName: updatedCustomer.first_name || firstName,
        lastName: updatedCustomer.last_name || lastName,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile", details: String(error) },
      { status: 500 },
    );
  }
}
