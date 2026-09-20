import { cn } from "@/lib/utils/cn";

const METHODS = ["PhonePe", "GPay", "UPI", "Cards", "Visa", "RuPay", "Mastercard", "NetBanking", "COD"];

export function SecurePaymentStrip({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-[var(--radius)] border border-border bg-white/80 p-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">Secure payment options</p>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            Pay safely through supported Indian payment methods at checkout.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2">
          {METHODS.map((method) => (
            <li
              key={method}
              className="gk-gradient-hover inline-flex min-h-8 items-center rounded-full border border-border bg-background px-3 text-[11px] font-medium text-foreground-muted"
            >
              {method}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
