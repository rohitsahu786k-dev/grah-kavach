import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, CheckIcon, FlameIcon, ShieldIcon } from "@/components/ui/icons";

const RISKS = [
  {
    title: "Electrical panel / MCB",
    text: "Keep the board visible, dust-free and reachable. Schedule inspection if breakers trip or warm up often.",
    position: "22% 26%",
  },
  {
    title: "Inverter / battery",
    text: "Backup power belongs in a ventilated corner with clear access, not under fabric or forgotten storage.",
    position: "74% 26%",
  },
  {
    title: "Kitchen",
    text: "Oil, flame and fabric meet here. Keep the blanket near the exit side, not across the cooking hazard.",
    position: "24% 74%",
  },
  {
    title: "Extension boards",
    text: "Avoid permanent overload. If a board runs hot or carries heavy loads daily, upgrade the wiring path.",
    position: "76% 74%",
  },
] as const;

export function RiskAreas() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--gk-header-h)+2rem)]">
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              Fire can start anywhere
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Prepare around the places everyday risk gathers.
            </h2>
            <p className="mt-4 leading-7 text-foreground-muted">
              A great kit is only half the story. The real upgrade is deciding where risk lives in
              your home, then keeping the right response close.
            </p>

            <div className="mt-8 overflow-hidden rounded-[8px] border border-border bg-foreground text-white">
              <div className="relative aspect-[16/10]">
                <Image
                  src="/home/risk-zones-editorial.png"
                  alt="Modern home risk zones including electrical panel, inverter, kitchen and extension board"
                  fill
                  sizes="(max-width: 1023px) 92vw, 38vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-5 bottom-5">
                  <p className="text-sm font-medium text-white">Map the risk before mounting.</p>
                  <p className="mt-1 text-xs leading-5 text-white/70">
                    General guidance only. It does not replace a qualified electrical inspection.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {RISKS.map((risk) => (
              <li
                key={risk.title}
                className="group overflow-hidden rounded-[8px] border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-background-subtle">
                  <Image
                    src="/home/risk-zones-editorial.png"
                    alt=""
                    fill
                    sizes="(max-width: 767px) 92vw, 26vw"
                    className="scale-[1.86] object-cover transition duration-500 group-hover:scale-[1.96] motion-reduce:transition-none"
                    style={{ objectPosition: risk.position }}
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-base font-medium text-foreground">{risk.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-foreground-muted">{risk.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

const STEPS = [
  {
    number: "01",
    title: "Extinguish",
    lead: "ABC dry powder extinguisher",
    text: "Use it only when the fire is small and your exit is clear. Aim at the base, squeeze, sweep, then leave if it does not settle quickly.",
  },
  {
    number: "02",
    title: "Activate",
    lead: "Automatic fire ball",
    text: "Place it near an identified risk point so it can respond to flame contact when nobody is standing next to the hazard.",
  },
  {
    number: "03",
    title: "Smother",
    lead: "Fire blanket",
    text: "Pull the tabs, cover the flame source and keep it covered. It is especially useful for small contained kitchen fires.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-foreground py-16 text-white lg:py-24">
      <Container width="wide">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-medium tracking-[0.18em] text-white/55 uppercase">
              How Graha Kavach works
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance lg:text-[42px]">
              Three responses, in the order you would need them.
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-start gap-3 lg:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-sm text-white/75">
              <ShieldIcon className="size-4 text-secondary" />
              Small fires caught early
            </span>
            <Button href="/safety-guide" variant="secondary">
              Explore Safety Guide
              <ArrowRightIcon className="size-4" />
            </Button>
          </div>
        </div>

        <ol className="mt-10 grid gap-4 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.number}
              className="relative overflow-hidden rounded-[8px] border border-white/10 bg-white/[0.07] p-6 lg:p-8"
            >
              <span className="text-sm font-medium tracking-[0.1em] text-secondary tabular-nums">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-medium lg:text-2xl">{step.title}</h3>
              <p className="mt-1.5 text-xs font-medium tracking-[0.12em] text-white/55 uppercase">
                {step.lead}
              </p>
              <p className="mt-4 text-sm leading-7 text-white/[0.72] lg:text-[15px]">{step.text}</p>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-[8px] border border-secondary/30 bg-secondary/10 px-4 py-3 text-sm leading-6 text-white/80">
          If a fire is spreading, or there is smoke you cannot see through, leave and call the fire
          service. These products are for small fires caught early.
        </p>
      </Container>
    </section>
  );
}

const PLACEMENTS = [
  {
    title: "Extinguisher",
    text: "Mount it in a common corridor or exit path at a height an adult can lift from quickly.",
  },
  {
    title: "Fire ball",
    text: "Set it on its stand or bracket near the electrical risk area it is meant to cover.",
  },
  {
    title: "Fire blanket",
    text: "Keep it near the kitchen exit, close enough to reach without crossing the cooking hazard.",
  },
] as const;

export function Placement() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-16">
          <div>
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              Placement and installation
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Where you put it decides whether it helps.
            </h2>
            <p className="mt-4 leading-7 text-foreground-muted">
              Mounting hardware for all three is in the box. Keep each response visible, reachable
              and closer to the exit path than the hazard.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {PLACEMENTS.map((item, index) => (
              <li key={item.title} className="rounded-[8px] border border-border bg-background-subtle p-4">
                <span className="gk-text-gradient text-sm font-medium tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-base font-medium text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 overflow-hidden rounded-[8px] border border-border bg-background-subtle">
          <div className="relative aspect-[16/9] min-h-[320px]">
            <Image
              src="/home/placement-installation.png"
              alt="Fire extinguisher, fire blanket and fire ball installed in a modern home"
              fill
              sizes="92vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
            <div className="absolute left-5 bottom-5 max-w-sm rounded-[8px] border border-white/15 bg-black/30 p-4 text-white backdrop-blur-md lg:left-8 lg:bottom-8">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FlameIcon className="size-4 text-secondary" />
                Ready should be visible
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                The safest kit is the one mounted before the emergency, not stored inside a
                cupboard.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Visible from daily routes", "Not behind the hazard", "Reachable without searching"].map(
            (item) => (
              <div key={item} className="flex items-center gap-3 rounded-[8px] bg-background-subtle p-4">
                <CheckIcon className="size-4 shrink-0 text-primary" />
                <p className="text-sm font-medium text-foreground">{item}</p>
              </div>
            ),
          )}
        </div>
      </Container>
    </section>
  );
}
