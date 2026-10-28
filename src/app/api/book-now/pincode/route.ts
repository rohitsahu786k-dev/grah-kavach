import { NextResponse } from "next/server";
import { INDIAN_STATES } from "@/lib/validation/checkout";

type PostOffice = { State?: string; District?: string };

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z]/g, "");

/** Maps India Post's state name to the code the order form uses. */
function stateCode(name: string): string | null {
  const wanted = normalise(name);
  const exact = INDIAN_STATES.find((state) => normalise(state.name) === wanted);
  if (exact) return exact.code;

  // India Post still lists the Union Territories on their own and calls Delhi "Delhi".
  const loose = INDIAN_STATES.find((state) => normalise(state.name).includes(wanted) || wanted.includes(normalise(state.name)));
  return loose?.code ?? null;
}

/** PIN code to state and district, so the booking form needs no state field. */
export async function GET(request: Request) {
  const pin = new URL(request.url).searchParams.get("pin") ?? "";

  if (!/^[1-9][0-9]{5}$/.test(pin)) {
    return NextResponse.json({ error: "Invalid PIN code." }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(4000),
    });
    const data = (await res.json()) as Array<{ Status?: string; PostOffice?: PostOffice[] | null }>;
    const office = data?.[0]?.Status === "Success" ? data[0].PostOffice?.[0] : null;

    if (!office?.State) return NextResponse.json({ found: false });

    return NextResponse.json({
      found: true,
      state: stateCode(office.State),
      district: office.District ?? "",
    });
  } catch {
    // The form falls back to asking for the state.
    return NextResponse.json({ found: false });
  }
}
