import { NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/session";
import { serverEnv } from "@/lib/env";

const loginSchema = z.object({
  username: z.string().trim().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const raw = await request.json();
    const parsed = loginSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid credentials format" },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;
    const env = serverEnv();
    const wpBase = env.WORDPRESS_URL.replace(/\/$/, "");

    // Authenticate with WordPress backend endpoint
    const res = await fetch(`${wpBase}/wp-json/gk/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: data.error || "Invalid email or password." },
        { status: 401 },
      );
    }

    // Set secure HTTP-only session cookie
    await setSessionCookie({
      customerId: data.customerId,
      email: data.email,
      username: data.username,
      firstName: data.firstName || "",
      lastName: data.lastName || "",
      roles: data.roles || [],
    });

    return NextResponse.json({
      success: true,
      customer: {
        customerId: data.customerId,
        email: data.email,
        username: data.username,
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        roles: data.roles || [],
        billing: data.billing || {},
        shipping: data.shipping || {},
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication service unavailable", details: String(error) },
      { status: 500 },
    );
  }
}
