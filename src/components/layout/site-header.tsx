import { buildWhatsAppUrl } from "@/lib/config/contact";
import { getGlobalSiteSettings } from "@/lib/wordpress/adapters";
import { HeaderBar } from "./header-bar";

/**
 * Server half of the header: reads the CMS once and hands the result to the
 * interactive bar. Keeping the fetch here means the logo, navigation, CTA and
 * announcement are rendered in the first HTML response rather than appearing
 * after hydration.
 */
export async function SiteHeader() {
  const settings = await getGlobalSiteSettings();

  return (
    <HeaderBar
      brandName={settings.brandName}
      logo={settings.logo}
      navigation={settings.headerNavigation}
      cta={settings.cta}
      announcement={settings.announcement}
      whatsappUrl={buildWhatsAppUrl(
        settings.contact.whatsapp,
        settings.contact.phone,
        "Hello Graha Kavach, I would like to know more about the fire safety kit.",
      )}
    />
  );
}
