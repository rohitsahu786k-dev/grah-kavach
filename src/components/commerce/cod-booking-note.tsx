import { cn } from "@/lib/utils/cn";
import { computeAdvanceMinor, type CodAdvanceConfig } from "@/lib/config/checkout";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";

type CodBookingNoteProps = {
  /** Price of one unit in paise. */
  priceMinor: number | null | undefined;
  currency?: string;
  config: CodAdvanceConfig | null | undefined;
  /** "dark" is for use over the photographic CTA banner. */
  tone?: "light" | "dark";
  className?: string;
};

/**
 * "Book now" line shown next to a price: the COD advance paid online now and
 * the balance paid on delivery. Renders nothing when partial payment is off,
 * so the amounts always follow the WooCommerce Deposits settings.
 */
export function CodBookingNote({
  priceMinor,
  currency = "INR",
  config,
  tone = "light",
  className,
}: CodBookingNoteProps) {
  if (!priceMinor) return null;

  const advanceMinor = computeAdvanceMinor(config ?? null, priceMinor);
  if (advanceMinor <= 0) return null;

  const balanceMinor = Math.max(0, priceMinor - advanceMinor);
  const dark = tone === "dark";

  return (
    <p
      className={cn(
        "inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-[var(--radius)] border px-3 py-2 text-sm leading-6",
        dark
          ? "border-white/20 bg-white/10 text-white/90"
          : "border-primary/20 bg-primary-subtle text-foreground-muted",
        className,
      )}
    >
      <span className={cn("font-semibold", dark ? "text-white" : "text-primary")}>
        COD: book with {formatMinorUnitsToCurrency(advanceMinor, currency)}
      </span>
      <span>
        and pay the remaining {formatMinorUnitsToCurrency(balanceMinor, currency)} on delivery.
      </span>
    </p>
  );
}
