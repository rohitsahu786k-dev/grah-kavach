/**
 * Advance collected online (Razorpay) on Cash on Delivery orders, in paise.
 * It is part of the order total, not an extra charge: the balance is paid on delivery.
 */
export const COD_ADVANCE_MINOR = 19900;
export const COD_ADVANCE_LABEL = "Paid now (COD advance)";

export function isCodMethod(methodId: string) {
  return methodId.toLowerCase() === "cod";
}
