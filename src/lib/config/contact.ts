/**
 * Contact links built from CMS values.
 *
 * The WhatsApp number is its own ACF field, but it is frequently left blank
 * because it is the same line as the primary phone. Falling back to the phone
 * keeps the WhatsApp action working without hard-coding a number into the
 * frontend — whichever field the client fills in, the button points at it.
 */

/** Digits only, with India's country code applied when the number is local. */
export function toWhatsAppNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export function buildWhatsAppUrl(
  whatsapp: string,
  fallbackPhone = "",
  message = "",
): string | null {
  const number = toWhatsAppNumber(whatsapp) ?? toWhatsAppNumber(fallbackPhone);
  if (!number) return null;

  const url = new URL(`https://wa.me/${number}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

/** `tel:` target with the spacing stripped, which some dialers choke on. */
export function buildTelUrl(phone: string): string | null {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned ? `tel:${cleaned}` : null;
}
