import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Flame, ArrowRight, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { getPageBySlug } from "@/lib/wordpress/adapters";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("how-it-works");

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: "How It Works: 3-Layered Home Fire Protection | Graha Kavach",
    fallbackDescription:
      "Discover how the Graha Kavach 3-in-1 Fire Safety Kit provides complete multi-stage defense: 24/7 automatic suppression, instant kitchen smothering, and active PASS knockdown.",
    path: "/how-it-works",
  });
}

export default function HowItWorksPage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
  ]);

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background-subtle to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Shield className="h-3.5 w-3.5" />
              Multi-Layer Defense
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              How the 3-in-1 System Protects Your Home.
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-muted sm:text-xl">
              No single fire tool solves every residential emergency. Graha Kavach layers 24/7 autonomous protection, clean kitchen smothering, and active chemical knockdown into one coordinated system.
            </p>
          </div>
        </div>
      </section>

      {/* 3-Tier Layered Architecture */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              The Three Layers
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              Engineered for Every Type of Domestic Fire
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-foreground-muted sm:text-base">
              From unmonitored night-time short circuits to high-heat kitchen grease flare-ups, each device has an explicit, proven role.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {/* Layer 1: Fire Ball */}
            <div className="relative flex flex-col rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                  LAYER 1 • 24/7 AUTONOMOUS
                </span>
                <Clock className="h-4 w-4 text-amber-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                Automatic Fire Extinguisher Ball
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
                1.3 kg • MAP Powder • Flame Activated
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                Mounted 30 cm above unmonitored hazards like the kitchen LPG cylinder or the main MCB panel. Operates automatically while you sleep or work.
              </p>

              <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Activates in 3–5 seconds upon direct flame</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>360° dispersion over 8–10 m² area</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>120 dB acoustic alarm alerts residents</span>
                </div>
              </div>
            </div>

            {/* Layer 2: Fire Blanket */}
            <div className="relative flex flex-col rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  LAYER 2 • KITCHEN & EGRESS
                </span>
                <Shield className="h-4 w-4 text-emerald-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                High-Temp Fire Blanket
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
                1m x 1m • 550°C Rated Pure Fibreglass
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                Mounted on the kitchen wall within instant arm’s reach. Starves oil and grease fires instantly without dangerous chemical powder residue or splattering.
              </p>

              <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Smothers burning oil without steam explosion</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Quick-release downward pull tape design</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Serves as emergency bodily heat escape shield</span>
                </div>
              </div>
            </div>

            {/* Layer 3: Fire Extinguisher */}
            <div className="relative flex flex-col rounded-2xl border border-border bg-white p-8 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                  LAYER 3 • ACTIVE KNOCKDOWN
                </span>
                <Flame className="h-4 w-4 text-red-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-foreground">
                2kg ABC Powder Extinguisher
              </h3>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-primary">
                2 kg • Pressurised MAP • Multi-Class
              </p>

              <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
                Your primary active response tool for rapidly spreading fires in living rooms, furniture, curtains, wiring, and vehicle garages.
              </p>

              <div className="mt-6 space-y-2 border-t border-border pt-4 text-xs text-foreground-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>10–12 second continuous discharge time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>3–4 metre safe stand-off throw distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Clear green-zone pressure gauge indicator</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real-Life Scenarios */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Response Scenarios
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              What to Do in Common Household Emergencies
            </h2>
          </div>

          <div className="mt-10 space-y-6">
            {/* Scenario 1 */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Scenario 1: Cooking Oil Catches Fire on the Stove
                </h3>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  Tool: Fire Blanket
                </span>
              </div>
              <p className="mt-4 text-sm text-foreground-muted">
                <strong>Action Sequence:</strong> Never use water. Pull the fire blanket tapes downward, shield your hands behind the top edges, and gently drape it across the burning pan. Immediately shut off the gas stove. Leave the blanket in place until cool.
              </p>
            </div>

            {/* Scenario 2 */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Scenario 2: Electrical Short-Circuit Behind Inverter at Night
                </h3>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  Tool: Automatic Fire Ball
                </span>
              </div>
              <p className="mt-4 text-sm text-foreground-muted">
                <strong>Action Sequence:</strong> When flames touch the ball mounted above the inverter, the thermal fuse ignites within 3–5 seconds. The ball bursts, suppressing the fire and emitting an acoustic alert to wake the household.
              </p>
            </div>

            {/* Scenario 3 */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
                <h3 className="text-lg font-bold text-foreground">
                  Scenario 3: Curtains / Furniture Ignite Near a Pooja Diya
                </h3>
                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                  Tool: 2kg ABC Extinguisher
                </span>
              </div>
              <p className="mt-4 text-sm text-foreground-muted">
                <strong>Action Sequence:</strong> Grab the extinguisher, pull the safety pin, stand 3 metres away with your back to an open exit, and squeeze the handle while sweeping side to side at the base of the fire until suppressed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Evacuation-First Warning */}
      <section className="bg-red-50 border-y border-red-200 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-red-950">
                Evacuation-First Safety Principle
              </h3>
              <p className="mt-1 text-sm text-red-800">
                All domestic fire equipment is designed strictly for small, early-stage (incipient) fires. If flames reach the ceiling, if thick toxic smoke fills the room, or if your exit path is compromised: <strong>evacuate everyone immediately, close doors behind you, and call 101.</strong> Never risk life for property.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Equip Your Home with the Complete Kit
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-foreground-muted">
            All three life-saving devices shipped together in one protective package with complete mounting hardware.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/checkout"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-primary-hover"
            >
              Buy Complete Kit (₹2,499)
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/safety-guide"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background-subtle"
            >
              Read Full Safety Guide
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
