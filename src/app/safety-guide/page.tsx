import type { Metadata } from "next";
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Compass,
  Zap,
} from "lucide-react";
import { getPageBySlug } from "@/lib/wordpress/adapters";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug("safety-guide");

  return buildSeoMetadata({
    seo: page?.seo,
    fallbackTitle: "Complete Home Fire Safety Guide | Graha Kavach",
    fallbackDescription:
      "Authoritative guide to domestic fire preparedness based on official Graha Kavach instructions: PASS protocol, Fire Ball deployment, Fire Blanket smothering, and emergency procedures.",
    path: "/safety-guide",
  });
}

const faqs = [
  {
    q: "How often should I inspect the Fire Extinguisher?",
    a: "Inspect the pressure gauge once every month. Ensure the needle is resting firmly inside the green zone. If the needle drops into the red 'Recharge' zone, have the cylinder serviced immediately.",
  },
  {
    q: "Will the Fire Ball activate from ambient room heat or summer weather?",
    a: "No. The Fire Ball is designed with a specialized ignition fuse that only triggers upon direct contact with an open flame (temperatures above 70°C). It will not activate from room heat, steam, or summer climate.",
  },
  {
    q: "Can I reuse a Fire Blanket after putting out a cooking fire?",
    a: "No. Fire blankets are designed for single-use emergency suppression. After exposure to burning oil or direct flames, the micro-fibreglass structure is degraded and must be replaced.",
  },
  {
    q: "What class of fires does the 2kg extinguisher cover?",
    a: "The 2kg ABC Dry Powder extinguisher covers Class A (solid combustibles like wood, cloth, paper), Class B (flammable liquids like petrol, paint, thinners), Class C (flammable gases like LPG), and electrical equipment fires up to 1000V.",
  },
  {
    q: "Why should water never be poured on a burning oil pan?",
    a: "Burning oil exceeds 300°C. Water poured onto it sinks and instantly vaporises into steam, expanding by 1,700 times. This violently ejects the burning oil into a massive fireball that can engulf the entire kitchen.",
  },
];

export default function SafetyGuidePage() {
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Safety Guide", path: "/safety-guide" },
  ]);
  const faqSchema = buildFaqSchema(faqs);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbSchema,
      ...(faqSchema ? [faqSchema] : []),
    ],
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-background-subtle to-background py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <ShieldAlert className="h-3.5 w-3.5" />
              Official Safety Manual
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              Home Fire Safety & Operating Guide
            </h1>
            <p className="mt-6 text-lg leading-8 text-foreground-muted sm:text-xl">
              Strict technical instructions based on the official Graha Kavach user manual. Learn how to identify hazards, position equipment, execute the PASS protocol, and react decisively during an emergency.
            </p>
          </div>
        </div>
      </section>

      {/* Emergency Hotline Alert */}
      <div className="border-b border-red-200 bg-red-600 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-semibold">
              IN A LIFE-THREATENING FIRE: EVACUATE IMMEDIATELY AND DIAL 101.
            </p>
          </div>
          <span className="hidden text-xs font-mono tracking-widest sm:inline-block uppercase">
            Emergency Service: 101 / 112
          </span>
        </div>
      </div>

      {/* 1. Fire-Risk Locations in Indian Homes */}
      <section className="py-16 md:py-20" id="risk-locations">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 1 • Hazard Identification
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            High-Risk Fire Zones in Indian Residences
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            Over 85% of domestic fire tragedies originate in one of these five specific zones. Proper awareness enables early mitigation.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Zone 1: Kitchen */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-red-50 p-2.5 text-red-600">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">1. Kitchen Cooking Zone</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Overheated frying oils, unattended gas burners, and degraded rubber LPG hoses. Cooking oil is flammable above 300°C and must never meet water.
              </p>
            </div>

            {/* Zone 2: LPG Cylinder Area */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">2. LPG Cylinder Storage</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Regulator connection points, pinhole leaks, and gas pooling in unventilated under-sink cabinets. Highly susceptible to delayed explosion.
              </p>
            </div>

            {/* Zone 3: Electrical MCB Panel */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">3. Main MCB / Distribution Board</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Loose terminal screws, circuit overload, and short-circuit sparks. Electrical fires produce toxic PVC smoke and spread rapidly along cable ducts.
              </p>
            </div>

            {/* Zone 4: Inverter & Battery Bank */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-amber-50 p-2.5 text-amber-600">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">4. Inverter & Battery Backup</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Lead-acid battery off-gassing, thermal runaway during prolonged power cuts, and heavy current charger wiring located in utility areas.
              </p>
            </div>

            {/* Zone 5: Pooja Ghar */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-red-50 p-2.5 text-red-600">
                <Flame className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">5. Pooja Mandir & Diyas</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Unattended oil lamps, camphor, and burning agarbatti in proximity to dry floral garlands, wooden woodwork, and decorative fabric.
              </p>
            </div>

            {/* Zone 6: High-Wattage Appliances */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-stone-100 p-2.5 text-stone-700">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-bold text-foreground">6. Air Conditioners & Heaters</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Overheated compressor coils, frayed power cords, and multi-plug daisy-chaining during peak summer or winter months.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Placement Guide */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20" id="placement-guide">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 2 • Strategic Positioning
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Where to Mount & Position Your Equipment
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            Equipment that cannot be reached during an emergency is useless. Follow these exact positioning guidelines.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {/* Extinguisher placement */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="font-mono text-xs font-bold text-primary uppercase">
                Device 1 • 2kg Extinguisher
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Exit Corridor / Hallway</h3>
              <ul className="mt-4 space-y-2 text-xs text-foreground-muted">
                <li>• Mount on wall bracket 1.0 to 1.5 metres above floor level.</li>
                <li>• Keep near exit doorway so you always fight with your back to safety.</li>
                <li>• Never hide inside deep cupboards or behind heavy furniture.</li>
                <li>• Avoid direct sunlight and moisture exposure.</li>
              </ul>
            </div>

            {/* Fire Ball placement */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="font-mono text-xs font-bold text-primary uppercase">
                Device 2 • Fire Ball
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">30cm Above High-Risk Hazard</h3>
              <ul className="mt-4 space-y-2 text-xs text-foreground-muted">
                <li>• Fix metal cradle firmly with screws 30 cm above LPG cylinder or MCB panel.</li>
                <li>• Position above inverter battery bank or electrical clusters.</li>
                <li>• Ensure clear 360° dispersion path with no blocking partitions.</li>
                <li>• Do not install directly above open cooktop burners.</li>
              </ul>
            </div>

            {/* Fire Blanket placement */}
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
              <div className="font-mono text-xs font-bold text-primary uppercase">
                Device 3 • Fire Blanket
              </div>
              <h3 className="mt-2 text-lg font-bold text-foreground">Kitchen Wall (Eye-Level)</h3>
              <ul className="mt-4 space-y-2 text-xs text-foreground-muted">
                <li>• Mount 1.5 metres from the floor near the kitchen exit door.</li>
                <li>• Position at least 2 metres away from the stove so you can reach it safely.</li>
                <li>• Ensure black pull-tapes hang freely downwards at all times.</li>
                <li>• Inform all household members and cooks of its location.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Fire Extinguisher: PASS Technique */}
      <section className="py-16 md:py-20" id="pass-technique">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 3 • Active Suppression
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Operating the Extinguisher: The PASS Technique
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            Remember the four-step protocol. Stand 3 to 4 metres away with an exit behind you before initiating.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* P */}
            <div className="relative rounded-xl border-2 border-primary/20 bg-primary-subtle/30 p-6 shadow-sm">
              <div className="text-4xl font-black text-primary">P</div>
              <h3 className="mt-3 text-lg font-bold text-foreground">PULL the Pin</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Firmly pull the metal ring pin straight out. This breaks the plastic tamper seal and unlocks the operating lever.
              </p>
            </div>

            {/* A */}
            <div className="relative rounded-xl border-2 border-primary/20 bg-primary-subtle/30 p-6 shadow-sm">
              <div className="text-4xl font-black text-primary">A</div>
              <h3 className="mt-3 text-lg font-bold text-foreground">AIM Low at Base</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Aim nozzle low at the base of the fire where the fuel is burning, not at the smoke or leaping flames.
              </p>
            </div>

            {/* S */}
            <div className="relative rounded-xl border-2 border-primary/20 bg-primary-subtle/30 p-6 shadow-sm">
              <div className="text-4xl font-black text-primary">S</div>
              <h3 className="mt-3 text-lg font-bold text-foreground">SQUEEZE Lever</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Squeeze the operating lever steadily. This discharges the pressurised MAP 90 dry chemical powder continuously.
              </p>
            </div>

            {/* S */}
            <div className="relative rounded-xl border-2 border-primary/20 bg-primary-subtle/30 p-6 shadow-sm">
              <div className="text-4xl font-black text-primary">S</div>
              <h3 className="mt-3 text-lg font-bold text-foreground">SWEEP Side-to-Side</h3>
              <p className="mt-2 text-xs leading-relaxed text-foreground-muted">
                Sweep the nozzle back and forth across the burning fuel base until the flames are fully extinguished.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fire Ball Deployment */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20" id="fire-ball">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 4 • Autonomous Suppression
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Fire Extinguisher Ball: Installation & Operation
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            Engineered for both autonomous stationary protection and active manual distance deployment.
          </p>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            {/* Automatic Mode */}
            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
                Automatic Stationary Mode
              </div>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Automatic Flame Activation
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                Install the wire cradle 30 cm above hazard spots. The ball requires no maintenance, batteries, or inspection for 5 years.
              </p>
              <div className="mt-6 space-y-3 border-t border-border pt-4 text-xs text-foreground-muted">
                <p><strong>1. Thermal Trigger:</strong> Contact with open flame triggers ignition cord in 3–5 seconds.</p>
                <p><strong>2. Instant Burst:</strong> Internal charge bursts outer shell safely, dispersing MAP powder 360° over 8–10 m².</p>
                <p><strong>3. Audible Alarm:</strong> Emits a loud ~120 dB percussive report that awakens sleeping occupants immediately.</p>
              </div>
            </div>

            {/* Manual Mode */}
            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Manual Distance Mode
              </div>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Manual Distance Deployment
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                Ideal for elders, teenagers, or anyone intimidated by traditional extinguishers.
              </p>
              <div className="mt-6 space-y-3 border-t border-border pt-4 text-xs text-foreground-muted">
                <p><strong>1. Safe Distance:</strong> Stand 5 to 7 metres away from the active fire.</p>
                <p><strong>2. Roll or Toss:</strong> Roll the ball along the floor or toss it directly into the base of the fire.</p>
                <p><strong>3. Autonomous Action:</strong> Upon contacting the flame, it activates in 3–5 seconds without further input.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Fire Blanket Procedure */}
      <section className="py-16 md:py-20" id="fire-blanket">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 5 • Smothering & Escape
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Fire Blanket: Kitchen Pan-Fire & Body Escape
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-foreground-muted">
            1m x 1m pure fibreglass rated up to 550°C. Eliminates oxygen starvation safely without mess.
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Pan-Fire Procedure */}
            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">
                Kitchen Pan-Fire Smothering Procedure
              </h3>
              <ol className="mt-4 space-y-3 text-xs leading-relaxed text-foreground-muted">
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">1.</span>
                  <span><strong>Pull Tapes Downward:</strong> Grasp both black tabs hanging below the pouch and yank downward firmly.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">2.</span>
                  <span><strong>Protect Your Hands:</strong> Roll top corners backward over your knuckles to shield hands from rising heat.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">3.</span>
                  <span><strong>Drape Gently:</strong> Place blanket gently over the burning pan from front to back. DO NOT throw.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">4.</span>
                  <span><strong>Turn Off Stove:</strong> Turn off burner knob and LPG regulator. Leave blanket in place until completely cold.</span>
                </li>
              </ol>
            </div>

            {/* Emergency Escape Guidance */}
            <div className="rounded-xl border border-border bg-white p-8 shadow-sm">
              <h3 className="text-lg font-bold text-foreground">
                Emergency Escape Heat Shield
              </h3>
              <ol className="mt-4 space-y-3 text-xs leading-relaxed text-foreground-muted">
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">1.</span>
                  <span><strong>Wrap Body:</strong> Drape blanket completely over the person’s shoulders like a cape.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">2.</span>
                  <span><strong>Cover Hair & Skin:</strong> Pull upper hem over head and hair to prevent ignition from radiant heat or falling sparks.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">3.</span>
                  <span><strong>Crawl Low:</strong> Evacuate crawling beneath the smoke layer towards the nearest external exit.</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-foreground">4.</span>
                  <span><strong>Stop, Drop & Roll:</strong> If clothing catches fire before wrapping, stop, drop to floor, and roll while smothering with blanket.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Emergency Do / Don't Grid */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20" id="do-dont">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 6 • Emergency Protocol
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Critical Emergency Do&apos;s &amp; Don&apos;ts
          </h2>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* DO */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-6">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle2 className="h-6 w-6" />
                <h3 className="text-lg font-bold">ALWAYS DO</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-emerald-950">
                <li>✓ <strong>Dial 101 immediately:</strong> Alert the local fire service before attempting to fight any fire.</li>
                <li>✓ <strong>Keep your back to an exit:</strong> Ensure an unblocked escape corridor behind you at all times.</li>
                <li>✓ <strong>Alert all residents:</strong> Shout and wake up every occupant before taking action.</li>
                <li>✓ <strong>Crawl low in smoke:</strong> Clean, breathable air stays within 30–60 cm of the floor.</li>
                <li>✓ <strong>Shut doors behind you:</strong> Slows down fire growth and smoke migration while evacuating.</li>
              </ul>
            </div>

            {/* DON'T */}
            <div className="rounded-xl border border-red-300 bg-red-50/50 p-6">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="h-6 w-6" />
                <h3 className="text-lg font-bold">NEVER DO</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-xs text-red-950">
                <li>✗ <strong>NEVER throw water on oil or grease:</strong> Causes immediate explosive steam fireball.</li>
                <li>✗ <strong>NEVER use water on electrical fires:</strong> Water conducts electricity, causing severe shock.</li>
                <li>✗ <strong>NEVER fight a spreading fire:</strong> If flames exceed wastebasket size, evacuate immediately.</li>
                <li>✗ <strong>NEVER use elevators:</strong> Electrical failure can trap you in the shaft. Always use stairs.</li>
                <li>✗ <strong>NEVER re-enter a burning building:</strong> Toxic carbon monoxide fumes can render you unconscious in seconds.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. After the Fire */}
      <section className="py-16 md:py-20" id="after-fire">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 7 • Recovery & Maintenance
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            After the Fire: Post-Incident Checklist
          </h2>

          <div className="mt-8 rounded-xl border border-border bg-white p-8 shadow-sm">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="font-bold text-foreground text-sm">1. Check for Smouldering</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Ensure deep embers inside mattresses, insulation, or wood trim are not continuing to smoulder silently.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">2. Ventilate Safely</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Open windows only after the fire department confirms complete extinguishment to disperse lingering powder and smoke.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">3. Discard Used Blanket</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Used fire blankets cannot be re-packed. Dispose of safely and replace with a fresh unit immediately.
                </p>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">4. Recharge Extinguisher</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  Even partial discharge requires immediate professional cylinder recharging to restore working pressure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Safety FAQs */}
      <section className="border-t border-border bg-background-subtle py-16 md:py-20" id="faqs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Section 8 • Frequently Asked Questions
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Safety & Maintenance FAQs
          </h2>

          <div className="mt-8 space-y-4 max-w-3xl">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="flex items-center gap-2 font-bold text-foreground text-base">
                  <HelpCircle className="h-4 w-4 text-primary flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-foreground-muted">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
