/**
 * Advance collected online (Razorpay) on Cash on Delivery orders.
 *
 * The amount is NOT hard-coded: it is read from the WooCommerce "Deposits &
 * Partial Payments" settings (see `getCodAdvanceConfig`), so changing it in
 * wp-admin changes it on the storefront. It is part of the order total, not an
 * extra charge: the balance is paid on delivery.
 */
export type CodAdvanceConfig = {
  /** False when partial payment is switched off: COD is then plain pay-on-delivery. */
  enabled: boolean;
  type: "fixed" | "percent";
  /** Rupees for "fixed", a percentage (0-100) for "percent". */
  value: number;
};

/** Used only when the backend cannot be reached. */
export const DEFAULT_COD_ADVANCE: CodAdvanceConfig = { enabled: true, type: "fixed", value: 199 };

export const COD_ADVANCE_LABEL = "Paid now (COD advance)";

/** The advance for a given order total, in paise. Never more than the total. */
export function computeAdvanceMinor(config: CodAdvanceConfig | null, totalMinor: number): number {
  if (!config?.enabled || totalMinor <= 0) return 0;
  const raw =
    config.type === "percent"
      ? Math.round((totalMinor * config.value) / 100)
      : Math.round(config.value * 100);
  return Math.max(0, Math.min(raw, totalMinor));
}

export function isCodMethod(methodId: string) {
  return methodId.toLowerCase() === "cod";
}
