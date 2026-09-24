import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Award, Factory, Flame, Compass, ArrowRight, ExternalLink, ShieldCheck, Beaker } from "lucide-react";
import { getAboutContent, getPageBySlug } from "@/lib/wordpress/adapters";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("about-us");

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: "About Graha Kavach | Manufacturing Experience, Udaipur",
    fallbackDescription:
      "Learn about Graha Kavach by Speciality Geochem, Udaipur. With manufacturing experience since 1996, we engineer certified, accessible fire safety solutions for Indian homes.",
    path: "/about",
  });
}

export default async function AboutPage() {
  const cmsAbout = await getAboutContent();
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "About Us", path: "/about" },
  ]);

  const introText =
    cmsAbout?.intro ||
    "Graha Kavach was born from a singular, urgent mission: making domestic fire preparedness accessible, practical, and uncompromisingly reliable for every Indian household.";

  const storyText =
    cmsAbout?.story ||
    "In India, domestic fires account for tens of thousands of preventable tragedies each year. While commercial high-rises and factories adhere to mandatory fire codes, private residences remain virtually unprotected. Traditional fire extinguishers are often heavy, intimidating, poorly maintained, or ignored until panic strikes. Graha Kavach was established to bridge this vital gap by combining industrial-grade chemical engineering with intuitive, family-first fire safety equipment.";

  const manufacturerText =
    cmsAbout?.manufacturer ||
    "Graha Kavach is manufactured by Speciality Geochem, located in the historic industrial hub of Udaipur, Rajasthan. Drawing upon deep manufacturing and chemical formulation experience established since 1996 across two RIICO production units, Speciality Geochem engineers top-tier extinguishing formulations, thermal fuses, and safety hardware that comply with rigorous national and international quality benchmarks.";

  const qualityText =
    cmsAbout?.quality ||
    "From non-toxic monoammonium phosphate (MAP 90) dry chemical formulations that suppress Class A, B, and C fires without electrical conductivity hazards, to 550°C heat-resistant woven fibreglass blankets and precision flame-activated fire balls, every product undergoes strict thermal and pressure endurance testing before leaving our Udaipur facility.";

  const missionText =
    cmsAbout?.mission ||
    "To eliminate fear and hesitation in domestic fire emergencies by equipping every Indian family with intuitive, reliable, and multi-layered early-stage fire protection.";

  const visionText =
    cmsAbout?.vision ||
    "A nation where every kitchen, apartment, and family home is equipped with active and automatic fire protection, dramatically cutting domestic fire casualties to zero.";

  const timelineItems =
    cmsAbout?.timeline && cmsAbout.timeline.length > 0
      ? cmsAbout.timeline
      : [
          {
            year: "1996",
            title: "Speciality Geochem Established",
            text: "Founded in Udaipur, Rajasthan, specialising in chemical formulations, industrial minerals, and certified fire-fighting equipment.",
          },
          {
            year: "2018",
            title: "Residential Safety Research",
            text: "Initiated focused research into domestic kitchen hazards, gas cylinder leaks, and electrical distribution short-circuits in Indian residences.",
          },
          {
            year: "2022",
            title: "Graha Kavach Prototype",
            text: "Engineered the integrated 3-in-1 protection system: combining 24/7 automatic suppression, instant kitchen smothering, and active PASS knockdown.",
          },
          {
            year: "2026",
            title: "Nationwide Direct Delivery",
            text: "Launched full direct-to-home delivery across all 28 states and 8 union territories with comprehensive family safety booklets.",
          },
        ];

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-background-subtle to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Shield className="h-3.5 w-3.5" />
              Our Story & Heritage
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Engineering Home Fire Safety for India.
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-muted sm:text-xl">
              {introText}
            </p>
          </div>
        </div>
      </section>

      {/* Origin & Home Preparedness */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Home Preparedness
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Why Home Fire Safety Demands a Different Approach
              </h2>
              <div className="mt-6 space-y-4 text-base leading-7 text-foreground-muted">
                {storyText.includes("<p>") ? (
                  <div dangerouslySetInnerHTML={{ __html: storyText }} />
                ) : (
                  <p>{storyText}</p>
                )}
                <p>
                  Most residential fires start small—an unattended oil pan on the gas stove, an electrical spark behind the inverter battery, or an overheated wire in the MCB board. With the right tools within immediate reach, these incidents can be extinguished in seconds before they escalate into full-room infernos.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-border pt-6">
                <div>
                  <p className="text-3xl font-bold text-foreground">24/7</p>
                  <p className="mt-1 text-xs text-foreground-muted">Automatic Vigilance</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">10-12s</p>
                  <p className="mt-1 text-xs text-foreground-muted">Instant Knockdown</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background-subtle p-8 lg:col-span-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary-subtle p-3 text-primary">
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Zero Compromise on Chemical Purity</h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                      We utilise MAP 90 dry powder that smothers flames chemically, without conducting electricity or emitting toxic fumes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary-subtle p-3 text-primary">
                    <Award className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">550°C Rated Pure Fibreglass</h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                      Our fire blankets contain no asbestos or synthetic fillers, withstanding extreme kitchen oil temperatures up to 550°C.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="rounded-lg bg-primary-subtle p-3 text-primary">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Practical Family Education</h3>
                    <p className="mt-1 text-sm text-foreground-muted">
                      Every kit includes simple pictorial booklets so elders, children, and domestic helpers can act confidently in an emergency.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing & Speciality Geochem, Udaipur */}
      <section className="border-y border-border bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left: Factory Image */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-stone-50 shadow-sm">
                <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="https://admin.grahakavach.in/wp-content/uploads/Speciality-Geochem-Factory-Entrance.png"
                    alt="Speciality Geochem Manufacturing Facility Entrance — Udaipur, Rajasthan"
                    width={1200}
                    height={800}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-4 border-t border-border bg-stone-50/80 flex items-center justify-between text-xs text-foreground-muted">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Factory className="h-4 w-4 text-primary" />
                    Speciality Geochem Manufacturing Unit
                  </span>
                  <span>Udaipur, Rajasthan</span>
                </div>
              </div>
            </div>

            {/* Right: Manufacturing Credentials & Company Information */}
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Factory className="h-3.5 w-3.5" />
                Speciality Geochem • Udaipur, Rajasthan
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
                30+ Years of Manufacturing & Chemical Engineering Excellence
              </h2>

              <div className="mt-5 space-y-4 text-sm sm:text-base leading-relaxed text-foreground-muted">
                {manufacturerText.includes("<p>") ? (
                  <div dangerouslySetInnerHTML={{ __html: manufacturerText }} />
                ) : (
                  <p>{manufacturerText}</p>
                )}
                {qualityText.includes("<p>") ? (
                  <div dangerouslySetInnerHTML={{ __html: qualityText }} />
                ) : (
                  <p>{qualityText}</p>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-lg border border-border bg-stone-50/60 p-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>2 RIICO Units</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground-muted">Industrial facilities in Udaipur</p>
                </div>

                <div className="rounded-lg border border-border bg-stone-50/60 p-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                    <Award className="h-4 w-4 text-primary" />
                    <span>ISO / CE Certified</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground-muted">Rigorous standards compliance</p>
                </div>

                <div className="rounded-lg border border-border bg-stone-50/60 p-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                    <Beaker className="h-4 w-4 text-primary" />
                    <span>In-House Testing</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground-muted">Thermal & pressure endurance lab</p>
                </div>

                <div className="rounded-lg border border-border bg-stone-50/60 p-3">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
                    <Factory className="h-4 w-4 text-primary" />
                    <span>Est. 1996</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-foreground-muted">Three decades of trust</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button
                  href="https://specialitygeochem.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  size="md"
                >
                  <span>Visit Speciality Geochem Official Website</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Our Mission
              </span>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Universal Early-Stage Intervention
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                {missionText}
              </p>
            </div>

            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Our Vision
              </span>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Zero Domestic Fire Casualties
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                {visionText}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestones Timeline */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Our Journey
            </span>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              A Legacy of Continuous Improvement
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {timelineItems.map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-xl border border-border bg-white p-6 shadow-sm"
              >
                <div className="inline-flex rounded-md bg-primary-subtle px-2.5 py-1 text-sm font-bold text-primary">
                  {item.year}
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-primary py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Protect Your Family Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-primary-subtle sm:text-lg">
            Equip your home with the complete 3-in-1 Graha Kavach Fire Safety Kit. Delivered directly from Udaipur with certified quality assurance.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-primary shadow transition hover:bg-stone-100"
            >
              Order Fire Safety Kit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/safety-guide"
              className="inline-flex items-center gap-2 rounded-md border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Read Free Safety Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
