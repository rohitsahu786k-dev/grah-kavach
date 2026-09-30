/** Flat handling charge added to Cash on Delivery orders, in paise. */
export const COD_FEE_MINOR = 19900;
export const COD_FEE_LABEL = "Cash on Delivery charges";

export function isCodMethod(methodId: string) {
  return methodId.toLowerCase() === "cod";
}
