import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionCustomer } from "@/lib/auth/session";
import {
  mergeWishlists,
  readCustomerWishlist,
  writeCustomerWishlist,
} from "@/lib/wishlist/server";

export const dynamic = "force-dynamic";

const idsSchema = z.object({
  productIds: z.array(z.number().int().positive()).max(200),
});

/**
 * The signed-in wishlist.
 *
 * A guest is not an error here: 200 with `authenticated: false` lets the client
 * keep its local list without treating a normal state as a failure.
 */
export async function GET() {
  const session = await getSessionCustomer();

  if (!session) {
    return NextResponse.json({ authenticated: false, productIds: [] });
  }

  try {
    const productIds = await readCustomerWishlist(session.customerId);
    return NextResponse.json({ authenticated: true, productIds });
  } catch {
    return NextResponse.json(
      { authenticated: true, productIds: [], error: "Could not read your saved items." },
      { status: 502 },
    );
  }
}

/** Replaces the stored list. Used after every local change while signed in. */
export async function PUT(request: Request) {
  const session = await getSessionCustomer();

  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = idsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid wishlist payload." }, { status: 400 });
  }

  try {
    const productIds = await writeCustomerWishlist(session.customerId, parsed.data.productIds);
    return NextResponse.json({ authenticated: true, productIds });
  } catch {
    return NextResponse.json({ error: "Could not save your wishlist." }, { status: 502 });
  }
}

/**
 * Merge on sign-in: union the guest list with the stored one and persist it.
 *
 * The client only clears its guest list once this responds successfully, so a
 * failed merge loses nothing.
 */
export async function POST(request: Request) {
  const session = await getSessionCustomer();

  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const parsed = idsSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid wishlist payload." }, { status: 400 });
  }

  try {
    const stored = await readCustomerWishlist(session.customerId);
    const merged = mergeWishlists(parsed.data.productIds, stored);
    const productIds = await writeCustomerWishlist(session.customerId, merged);
    return NextResponse.json({ authenticated: true, productIds });
  } catch {
    return NextResponse.json({ error: "Could not merge your wishlist." }, { status: 502 });
  }
}
