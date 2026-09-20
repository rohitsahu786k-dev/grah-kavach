import Image from "next/image";
import Link from "next/link";
import { SecurePaymentStrip } from "@/components/commerce/secure-payment-strip";
import { Button } from "@/components/ui/button";
import { MailIcon, PhoneIcon, PinIcon, WhatsAppIcon } from "@/components/ui/icons";
import { buildTelUrl, buildWhatsAppUrl } from "@/lib/config/contact";
import { getCmsPages, getGlobalSiteSettings, type NavItem } from "@/lib/wordpress/adapters";
import { FooterNavGroup } from "./footer-nav-group";

/*
 * The footer.
 *
 * White at the top so the last section of the page runs into it without a
 * seam, warming into the logo's amber and shield red at the very bottom. The
 * gradient is a tint, not a colour field: body copy here sits on something
 * within a couple of percent of white, so contrast is effectively unchanged.
 *
 * Contact details, social links, footer groups and the copyright line all come
 * from WordPress. Anything the client has not filled in is omitted rather than
 * shown empty.
 */

const DEFAULT_EXPLORE: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Fire Safety Kit", href: "/fire-safety-kit" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Safety Guide", href: "/safety-guide" },
  { label: "About Us", href: "/about" },
];

const DEFAULT_SUPPORT: NavItem[] = [
  { label: "Contact", href: "/contact" },
  { label: "Track Order", href: "/track-order" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
];

export async function SiteFooter() {
  const [settings, cmsPages] = await Promise.all([getGlobalSiteSettings(), getCmsPages()]);
  const { contact } = settings;

  const whatsappUrl = buildWhatsAppUrl(contact.whatsapp, contact.phone);
  const telUrl = buildTelUrl(contact.phone);

  // CMS groups win when the client has configured them; otherwise the site's
  // own information architecture is used rather than an empty column.
  const cmsGroups = settings.footerGroups.filter((group) => group.links.length > 0);
  const groups =
    cmsGroups.length > 0
      ? cmsGroups.slice(0, 2)
      : [
          { title: "Explore", links: DEFAULT_EXPLORE },
          { title: "Support", links: DEFAULT_SUPPORT },
        ];
  /*
   * Policy links come from WordPress, not from this file.
   *
   * The ACF "Legal links" rows win when an editor has set them, because that
   * is explicit ordering and wording. Otherwise every published page that is
   * not already a hand-built route is listed — so a new policy page appears
   * here, and gets a working URL, the moment it is published. A hard-coded
   * list would silently point at slugs that may not exist.
   */
  const legalLinks: NavItem[] =
    settings.legalLinks.length > 0
      ? settings.legalLinks
      : cmsPages.map((page) => ({ label: page.title, href: page.href }));

  return (
    <footer className="gk-footer-surface border-t border-border">
      {/* Closing call to action */}
      <section className="mx-auto w-full max-w-[1400px] px-4 pt-14 pb-12 xs:px-5 lg:px-8 lg:pt-20 lg:pb-16 xl:px-10">
        <div className="grid items-end gap-6 lg:grid-cols-[1.3fr_auto]">
          <div>
            <h2 className="max-w-xl text-3xl leading-tight font-medium tracking-tight text-foreground lg:text-[40px]">
              Make fire preparedness part of your home.
            </h2>
            <p className="mt-4 max-w-lg leading-7 text-foreground-muted">
              One kit, three ways to respond, kept where you can actually reach it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/fire-safety-kit" size="lg">
              Explore Fire Safety Kit
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              Talk to Us
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] px-4 xs:px-5 lg:px-8 xl:px-10">
        <div className="border-t border-border/80" />
      </div>

      {/* Main footer */}
      <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-4 py-10 xs:px-5 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10 lg:px-8 lg:py-14 xl:px-10">
        <div className="lg:pr-6">
          <Link href="/" className="inline-flex items-center">
            {settings.logo?.url ? (
              <Image
                src={settings.logo.url}
                alt={settings.logo.alt || settings.brandName}
                width={settings.logo.width ?? 240}
                height={settings.logo.height ?? 80}
                className="h-10 max-w-[190px] object-contain sm:h-12 sm:max-w-[230px]"
                priority={false}
              />
            ) : null}
          </Link>

          {settings.description ? (
            <p className="mt-4 max-w-sm text-sm leading-6 text-foreground-muted">
              {settings.description}
            </p>
          ) : null}

          {settings.socialLinks.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {settings.socialLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gk-gradient-hover inline-flex min-h-9 items-center rounded-full border border-border bg-white/70 px-3.5 text-xs font-medium text-foreground-muted transition-colors hover:border-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {groups.map((group) => (
          <FooterNavGroup key={group.title} title={group.title} links={group.links} />
        ))}

        <div className="border-b border-border/70 py-1 lg:border-0 lg:py-0">
          <h3 className="flex min-h-12 items-center text-sm font-medium text-foreground lg:min-h-0">
            Contact
          </h3>
          <ul className="grid gap-3 pb-3 text-sm lg:mt-4 lg:pb-0">
            {telUrl ? (
              <li>
                <a
                  href={telUrl}
                  className="gk-gradient-hover inline-flex min-h-9 items-start gap-2.5 text-foreground-muted transition-colors"
                >
                  <PhoneIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {contact.phone}
                </a>
              </li>
            ) : null}

            {contact.email ? (
              <li>
                <a
                  href={`mailto:${contact.email}`}
                  className="gk-gradient-hover inline-flex min-h-9 items-start gap-2.5 break-all text-foreground-muted transition-colors"
                >
                  <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  {contact.email}
                </a>
              </li>
            ) : null}

            {whatsappUrl ? (
              <li>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gk-gradient-hover inline-flex min-h-9 items-start gap-2.5 text-foreground-muted transition-colors"
                >
                  <WhatsAppIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  WhatsApp
                </a>
              </li>
            ) : null}

            {contact.address ? (
              <li>
                {contact.mapsUrl ? (
                  <a
                    href={contact.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gk-gradient-hover inline-flex items-start gap-2.5 text-foreground-muted transition-colors"
                  >
                    <PinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="whitespace-pre-line leading-6">{contact.address}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-start gap-2.5 text-foreground-muted">
                    <PinIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="whitespace-pre-line leading-6">{contact.address}</span>
                  </span>
                )}
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 pb-8 xs:px-5 lg:px-8 xl:px-10">
        <SecurePaymentStrip />
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/80">
        <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-4 py-6 text-xs text-muted-foreground xs:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-8 xl:px-10">
          <p>
            {settings.copyright ||
              `Copyright ${new Date().getFullYear()} ${settings.brandName}. All rights reserved.`}
          </p>

          {legalLinks.length > 0 ? (
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
              {legalLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="gk-gradient-hover inline-flex min-h-9 items-center transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
