import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { cn } from "@/lib/utils/cn";

/* ------------------------------------------------------------------ */
/* Section 5 — fire risks around the home                              */
/* ------------------------------------------------------------------ */

const RISKS = [
  {
    title: "Electrical panel / MCB",
    text: "Distribution boards collect dust and heat. They need clear access and periodic inspection by a qualified electrician.",
    placeholder: "Electrical Panel Safety Image",
  },
  {
    title: "Inverter / battery",
    text: "Backup power sits in cupboards and lofts, often unventilated and rarely looked at between failures.",
    placeholder: "Inverter and Battery Image",
  },
  {
    title: "Kitchen",
    text: "Oil, open flame and fabric in one room. The most common place a household fire starts, and the one most often left unequipped.",
    placeholder: "Kitchen Safety Image",
  },
  {
    title: "Old or overloaded wiring",
    text: "Extension boards carrying more than they were rated for, and decades-old wiring behind plaster, are worth having checked.",
    placeholder: "Household Wiring Image",
  },
] as const;

/**
 * Educational, not alarmist.
 *
 * These are the places an Indian home most often has a problem. Each is stated
 * plainly with the sensible response, and the section says outright that it is
 * not a substitute for an inspection — because a safety brand that implies its
 * product replaces professional checks is selling the wrong thing.
 */
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
              This is general guidance. It does not replace an electrical inspection, correct
              installation, or calling the fire service.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2">
            {RISKS.map((risk) => (
              <li
                key={risk.title}
                className="overflow-hidden rounded-[var(--radius)] border border-border bg-white"
              >
                <MediaPlaceholder label={risk.placeholder} aspect="3/2" className="rounded-none border-0 border-b border-dashed" />
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

/* ------------------------------------------------------------------ */
/* Section 6 — how Graha Kavach works                                  */
/* ------------------------------------------------------------------ */

const STEPS = [
  {
    number: "01",
    title: "Extinguish",
    lead: "ABC dry powder extinguisher",
    text: "For a small fire you can safely approach. Pull the pin, aim at the base of the flame, squeeze, and sweep. Leave if it does not go out quickly.",
  },
  {
    number: "02",
    title: "Activate",
    lead: "Automatic fire ball",
    text: "Mounted near an identified risk area, it responds to flame contact without anyone present. Follow the placement instructions supplied with the product.",
  },
  {
    number: "03",
    title: "Smother",
    lead: "Fire blanket",
    text: "Pull the tabs, cover the flame source to cut off air, and leave it covered. Suited to small contained fires, including those on a stovetop.",
  },
] as const;

/**
 * What each product does, in the order you would reach for them.
 *
 * The instructions are deliberately short and each one ends with the limit of
 * its own advice; the full procedure lives in the safety guide. Compressing
 * fire instructions into a tidy three-word summary is how people get hurt.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background-subtle py-16 lg:py-24">
      <Container width="wide">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              How Graha Kavach works
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Three responses, in the order you would need them.
            </h2>
          </div>
          <Button href="/safety-guide" variant="outline">
            Explore Safety Guide
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <ol className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius)] border border-border bg-border md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.number} className="bg-white p-6 lg:p-8">
              <span className="gk-text-gradient text-sm font-medium tracking-[0.1em] tabular-nums">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-medium text-foreground lg:text-2xl">{step.title}</h3>
              <p className="mt-1.5 text-xs font-medium tracking-[0.12em] text-secondary uppercase">
                {step.lead}
              </p>
              <p className="mt-4 text-sm leading-7 text-foreground-muted lg:text-[15px]">
                {step.text}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 rounded-[var(--radius)] border border-warning/30 bg-warning-subtle px-4 py-3 text-sm leading-6 text-warning">
          If a fire is spreading, or there is smoke you cannot see through, leave and call the fire
          service. These products are for small fires caught early.
        </p>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 8 — placement and installation                              */
/* ------------------------------------------------------------------ */

const PLACEMENTS = [
  {
    title: "Extinguisher",
    text: "Mount it on the supplied bracket in a common area or corridor — somewhere on the way out, at a height an adult can lift it from. Not inside the room most likely to be on fire.",
    placeholder: "Extinguisher Placement Image",
  },
  {
    title: "Fire ball",
    text: "Set it on its stand or bracket near the electrical risk area it is meant to cover, following the instructions supplied with the product.",
    placeholder: "Fire Ball Placement Image",
  },
  {
    title: "Fire blanket",
    text: "Keep it near the kitchen exit, within reach without crossing the cooking hazard to get to it.",
    placeholder: "Fire Blanket Placement Image",
  },
] as const;

/**
 * Editorial rows, alternating sides.
 *
 * Placement is the part customers get wrong, so it gets full-width imagery and
 * room to explain rather than a bullet list.
 */
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
            <article
              key={item.title}
              className="grid items-center gap-6 lg:grid-cols-2 lg:gap-14"
            >
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
      </Container>
    </section>
  );
}
