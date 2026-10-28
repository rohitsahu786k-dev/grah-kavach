import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookingFlow } from "@/components/landing/booking-flow";
import { getLandingPricing } from "@/lib/landing/pricing";
import { fillTokens } from "@/lib/landing/text";
import { formatMinorUnitsToCurrency } from "@/lib/woocommerce/adapters";
import { getGlobalSiteSettings, getLanding } from "@/lib/wordpress/adapters";

// The booking steps are a transactional funnel: useful to the customer, not for search results.
export const metadata: Metadata = {
  title: "Book Now",
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function BookNowDetailsPage() {
  const [landing, pricing, settings] = await Promise.all([getLanding(), getLandingPricing(), getGlobalSiteSettings()]);

  if (!landing || !pricing) notFound();

  const t = (text: string) => fillTokens(text, pricing, landing.endTime);
  const money = (minor: number) => formatMinorUnitsToCurrency(Math.max(0, minor), pricing.currency);
  const discountMinor = pricing.mrpMinor - pricing.priceMinor;

  return (
    <BookingFlow
      countdown={{ endTime: landing.endTime, endsAt: landing.endsAt }}
      content={{
        logoUrl: settings.logo?.url ?? "/brand/graha-kavach-logo.png",
        logoAlt: settings.logo?.alt || "Graha Kavach",
        lockLabel: landing.lockLabel,
        detailsTitle: landing.detailsTitle,
        detailsSub: landing.detailsSub,
        detailsNote: landing.detailsNote,
        payTitle: t(landing.payTitle),
        paySecure: landing.paySecure,
        doneTitle: landing.doneTitle,
        doneText: t(landing.doneText),
        doneSteps: landing.doneSteps.map((row) => t(row.text)),
        doneWhatsappLabel: landing.doneWhatsappLabel,
        whatsappKeyword: landing.whatsappKeyword,
        doneHomeLabel: landing.doneHomeLabel,
        phone: landing.phone,
      }}
      money={{
        productId: pricing.productId,
        priceMinor: pricing.priceMinor,
        advanceMinor: pricing.advanceMinor,
        currency: pricing.currency,
        price: money(pricing.priceMinor),
        advance: money(pricing.advanceMinor),
        balance: money(pricing.priceMinor - pricing.advanceMinor),
        discount: discountMinor > 0 ? money(discountMinor) : "",
      }}
    />
  );
}
