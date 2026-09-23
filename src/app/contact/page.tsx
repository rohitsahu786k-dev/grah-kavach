import type { Metadata } from "next";
import { Phone, Mail, MapPin, MessageSquare, Clock, ShieldCheck } from "lucide-react";
import {
  getFaqs,
  getGlobalSiteSettings,
  getPageBySlug,
  getProductContent,
  getSafetyGuides,
} from "@/lib/wordpress/adapters";
import { CertificationMarquee } from "@/components/home/certification-marquee";
import { SafetyGuides } from "@/components/home/safety-guides";
import { FaqSection } from "@/components/home/conversion";
import { ContactForm } from "@/components/contact/contact-form";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildOrganizationSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("contact-us");

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: "Contact Fire Safety Team | Graha Kavach",
    fallbackDescription:
      "Get in touch with Graha Kavach fire safety specialists for product inquiries, bulk orders, residential safety consultations, and customer support in Udaipur, Rajasthan.",
    path: "/contact",
  });
}

export default async function ContactPage() {
  const [settings, safetyGuides, faqs, productContent] = await Promise.all([
    getGlobalSiteSettings(),
    getSafetyGuides(8),
    getFaqs(8),
    getProductContent("graha-kavach-complete-fire-safety-kit"),
  ]);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]);
  const orgSchema = buildOrganizationSchema();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [breadcrumbSchema, orgSchema],
  };

  const phone = settings.contact.phone || "+91 9610251841";
  const cleanPhone = phone.replace(/[^0-9+]/g, "");
  const email = settings.contact.email || "grahakavach@gmail.com";
  const address =
    settings.contact.address ||
    "103, Ostwal Plaza 2, Sundarwas, Udaipur (Raj.) India";
  const whatsappNumber =
    settings.contact.whatsapp || cleanPhone.replace("+", "");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Graha Kavach, I would like to know more about the Fire Safety Kit."
  )}`;

  return (
    <div className="bg-background py-12 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            Direct Support & Consultation
          </span>
          <h1 className="mt-4 text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
            Contact Graha Kavach
          </h1>
          <p className="mt-3 text-base text-foreground-muted sm:text-lg">
            Whether you need fire safety recommendations for your home, have questions about your order, or need apartment society guidance, our team is here to assist you.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Contact Details & Google Map */}
          <div className="space-y-6 lg:col-span-5">
            {/* Quick Contact Cards */}
            <div className="space-y-4">
              {/* Phone */}
              <a
                href={`tel:${cleanPhone}`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <div className="rounded-lg bg-primary-subtle p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Phone Support
                  </h3>
                  <p className="mt-1 text-base font-medium text-foreground">
                    {phone}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Mon–Sat: 9:00 AM – 6:00 PM IST
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${email}`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
              >
                <div className="rounded-lg bg-primary-subtle p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Email Inquiry
                  </h3>
                  <p className="mt-1 text-base font-medium text-foreground">
                    {email}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    Expect responses within 2 business hours
                  </p>
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="rounded-lg bg-emerald-600 p-3 text-white transition group-hover:bg-emerald-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-emerald-800">
                    Instant WhatsApp Chat
                  </h3>
                  <p className="mt-1 text-base font-medium text-emerald-950">
                    Chat with an Advisor
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-700">
                    Fastest answers for product & order queries
                  </p>
                </div>
              </a>

              {/* Address */}
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="rounded-lg bg-background-subtle p-3 text-foreground-muted">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Head Office & Manufacturing Hub
                  </h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-foreground whitespace-pre-line">
                    {address}
                  </p>
                </div>
              </div>

              {/* Support Hours */}
              <div className="flex items-start gap-4 rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="rounded-lg bg-background-subtle p-3 text-foreground-muted">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                    Business Hours
                  </h3>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    Monday to Saturday: 9:00 AM – 6:00 PM IST
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Closed on Sundays and National Holidays
                  </p>
                </div>
              </div>
            </div>

            {/* Embedded Google Map */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="border-b border-border bg-background-subtle px-4 py-2.5">
                <p className="text-xs font-medium uppercase tracking-wider text-foreground-muted">
                  Location Map — Udaipur, Rajasthan
                </p>
              </div>
              <div className="h-64 w-full bg-stone-100">
                <iframe
                  title="Graha Kavach Udaipur Location"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    address
                  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>

      {/*
       * Below the form: the same guide, certification and FAQ sections the
       * homepage uses. Someone who lands here with a question is usually one
       * answer away from not needing to send the form at all.
       */}
      <div className="mt-16 -mb-12 md:-mb-16">
        <SafetyGuides
          guides={safetyGuides.map((g) => ({ id: g.id, title: g.title, summary: g.summary }))}
        />

        <CertificationMarquee
          title="Certified and tested"
          certifications={productContent?.certifications ?? []}
        />

        <FaqSection
          title="Before you write to us"
          items={faqs.map((faq) => ({ id: faq.id, title: faq.title, answer: faq.answer }))}
        />
      </div>
    </div>
  );
}
