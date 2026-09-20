import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { serverEnv } from "@/lib/env";

const payloadSchema = z.object({
  tags: z.array(z.string().min(1)).default([]),
  paths: z.array(z.string().startsWith("/")).default([]),
  timestamp: z.number(),
  source: z.string().optional(),
});

function verifySignature(body: string, signatureHeader: string | null, secret: string) {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;

  const provided = Buffer.from(signatureHeader.slice("sha256=".length), "hex");
  const expected = Buffer.from(createHmac("sha256", secret).update(body).digest("hex"), "hex");

  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export async function POST(request: Request) {
  const secret = serverEnv().REVALIDATION_SECRET;

  if (!secret) {
    return NextResponse.json({ error: "Revalidation is not configured." }, { status: 503 });
  }

  const body = await request.text();

  if (!verifySignature(body, request.headers.get("x-gk-signature"), secret)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let json: unknown;

  try {
    json = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Malformed revalidation payload." }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Malformed revalidation payload." }, { status: 400 });
  }

  const ageSeconds = Math.abs(Date.now() / 1000 - parsed.data.timestamp);

  if (ageSeconds > 300) {
    return NextResponse.json({ error: "Expired revalidation payload." }, { status: 408 });
  }

  for (const tag of parsed.data.tags) {
    revalidateTag(tag, "max");
  }

  for (const path of parsed.data.paths) {
    revalidatePath(path);
  }

  return NextResponse.json({
    revalidated: true,
    tags: parsed.data.tags,
    paths: parsed.data.paths,
  });
}
