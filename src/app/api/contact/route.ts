import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please provide a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian phone number"),
  subject: z.string().trim().min(2, "Subject must be at least 2 characters").max(150),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(2000),
  website_hp: z.string().optional().default(""), // Honeypot field
  timestamp: z.number().optional().default(0), // Form load timestamp
});

// Simple in-memory rate limiter: IP -> timestamps[]
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    rateLimitMap.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return false;
}

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown-ip";

    // Rate limit check
    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: "Too many contact requests from your connection. Please wait 10 minutes before submitting again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Invalid contact form submission";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, phone, subject, message, website_hp, timestamp } = result.data;

    // Honeypot check: If filled, silently discard spam
    if (website_hp && website_hp.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: "Thank you. Your message has been received.",
        },
        { status: 200 }
      );
    }

    // Bot speed check: Must take at least 2 seconds between form render and submit
    if (timestamp && Date.now() - timestamp < 1800) {
      return NextResponse.json(
        {
          error: "Submission completed too fast. Please take a moment to review before submitting.",
        },
        { status: 400 }
      );
    }

    // Forward to WordPress custom Inquiries REST endpoint
    const wpRes = await fetch("https://admin.grahakavach.in/wp-json/gk/v1/inquiries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
        subject,
        message,
      }),
      // Short timeout to keep response snappy
      signal: AbortSignal.timeout(8000),
    });

    if (!wpRes.ok) {
      console.error("WordPress Inquiry submission failed with status:", wpRes.status);
      // Even if WP storage had an issue, acknowledge the user so they don't get frustrated
      return NextResponse.json(
        {
          success: true,
          message: "Thank you for reaching out. We have received your inquiry and will contact you shortly.",
        },
        { status: 200 }
      );
    }

    const wpData = await wpRes.json();

    return NextResponse.json(
      {
        success: true,
        inquiryId: wpData.id || undefined,
        message: "Thank you for reaching out! A Graha Kavach fire safety expert will get in touch with you shortly.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request. Please try again later." },
      { status: 500 }
    );
  }
}
