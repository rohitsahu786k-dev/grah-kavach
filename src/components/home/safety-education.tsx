import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, CheckIcon, FlameIcon, ShieldIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { cn } from "@/lib/utils/cn";

const RISKS = [
  {
    title: "Electrical panel / MCB",
    text: "Distribution boards collect dust and heat. Keep them visible, reachable and inspected by a qualified electrician.",
    placeholder: "Electrical Panel Safety Image",
  },
  {
    title: "Inverter / battery",
    text: "Backup power sits in cupboards and lofts, often unventilated and rarely checked between failures.",
    placeholder: "Inverter and Battery Image",
  },
  {
    title: "Kitchen",
    text: "Oil, open flame and fabric meet here. Keep the blanket near the exit side, not across the cooking hazard.",
    placeholder: "Kitchen Safety Image",
  },
  {
    title: "Old or overloaded wiring",
    text: "Extension boards and old wiring are worth checking before they become everyday risk.",
    placeholder: "Household Wiring Image",
  },
] as const;

export function RiskAreas() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-[calc(var(--gk-header-h)+2rem)] lg:self-start">
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              Fire can start anywhere
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Prepare around the places everyday risk gathers.
            </h2>
            <p className="mt-4 leading-7 text-foreground-muted">
              Inspired by 21st.dev bento sections: the biggest idea gets the copy, while the cards
              stay scannable. This guidance does not replace a professional inspection.
            </p>

            <div className="mt-8 rounded-[8px] border border-border bg-background-subtle p-5">
              <div className="flex items-start gap-3">
                <ShieldIcon className="mt-1 size-5 shrink-0 text-primary" />
                <p className="text-sm leading-6 text-foreground-muted">
                  Mount the kit where you move through the home, not inside the risk zone itself.
                </p>
              </div>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {RISKS.map((risk, index) => (
              <li
                key={risk.title}
                className={cn(
                  "overflow-hidden rounded-[8px] border border-border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  index === 2 && "sm:col-span-2",
                )}
              >
                <MediaPlaceholder
                  label={risk.placeholder}
                  aspect={index === 2 ? "16/9" : "3/2"}
                  className="rounded-none border-0 border-b border-dashed"
                />
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
    text: "Use it only when the fire is small and your exit is clear. Aim at the base, squeeze and sweep.",
  },
  {
    number: "02",
    title: "Activate",
    lead: "Automatic fire ball",
    text: "Place it near an identified risk point so it can respond to flame contact when nobody is nearby.",
  },
  {
    number: "03",
    title: "Smother",
    lead: "Fire blanket",
    text: "Pull the tabs, cover the flame source and keep it covered. Useful for small contained kitchen fires.",
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
            <span className="inline-flex items-center gap-2 rounded-[8px] border border-white/15 bg-white/[0.08] px-4 py-2 text-sm text-white/75">
              <FlameIcon className="size-4 text-secondary" />
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
              className="rounded-[8px] border border-white/10 bg-white/[0.07] p-6 lg:p-8"
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
    text: "Mount it on the supplied bracket in a common area or corridor, somewhere on the way out.",
    placeholder: "Extinguisher Placement Image",
  },
  {
    title: "Fire ball",
    text: "Set it on its stand or bracket near the electrical risk area it is meant to cover.",
    placeholder: "Fire Ball Placement Image",
  },
  {
    title: "Fire blanket",
    text: "Keep it near the kitchen exit, within reach without crossing the cooking hazard.",
    placeholder: "Fire Blanket Placement Image",
  },
] as const;

export function Placement() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="max-w-2xl">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
            Placement and installation
          </p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            Where you put it decides whether it helps.
          </h2>
          <p className="mt-4 leading-7 text-foreground-muted">
            Mounting hardware for all three is in the box. Never place a device where reaching it
            would put you between yourself and the way out.
          </p>
        </div>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:gap-20">
          {PLACEMENTS.map((item, index) => (
            <article key={item.title} className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14">
              <MediaPlaceholder
                label={item.placeholder}
                aspect="3/2"
                className={cn(index % 2 === 1 && "lg:order-2")}
              />
              <div className={cn(index % 2 === 1 && "lg:order-1")}>
                <span className="gk-text-gradient text-sm font-medium tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-2xl font-medium tracking-[-0.01em] text-foreground lg:text-3xl">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-foreground-muted">{item.text}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-3">
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
