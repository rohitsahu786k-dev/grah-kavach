import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";

/*
 * The safety guide, on the homepage.
 *
 * Layout from the 21st.dev "How It Works Steps" block: numbered circles on a
 * single horizontal rule that runs behind them, each step centred under its
 * marker, the rule hidden below md where the steps stack, and a down-arrow
 * shown between stacked steps instead. The centred CTA under the row is from
 * the same block.
 *
 * Content is the Safety Guides collection in WordPress — the material from the
 * printed guide — so editing a guide there changes this section.
 */

export type GuideStep = {
  id: string | number;
  title: string;
  summary: string;
  slug?: string;
};

export function SafetyGuides({ guides }: { guides: GuideStep[] }) {
  if (guides.length === 0) return null;

  const steps = guides.slice(0, 5);

  return (
    <section className="bg-background-subtle py-20 lg:py-28">
      <Container width="default">
        <div className="mb-14 flex flex-col items-center gap-3 text-center">
          <span className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
            From the safety guide
          </span>
          <h2 className="text-balance text-3xl leading-[1.12] font-medium tracking-[-0.03em] text-foreground lg:text-[44px]">
            What to do in the first minute.
          </h2>
          <p className="mt-1 max-w-xl leading-7 text-foreground-muted">
            The short version of the guide that ships with the kit. Read it before you need it.
          </p>
        </div>

        <ol className="relative grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-6">
          {/* The rule the markers sit on. Hidden once the steps stack. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-6 hidden h-px bg-border md:block" />

          {steps.slice(0, 3).map((step, index) => (
            <li key={step.id} className="relative flex flex-col items-center gap-4 text-center">
              <div className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background">
                <span className="text-xs font-medium tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-medium tracking-[-0.01em] text-balance text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-foreground-muted">{step.summary}</p>
              </div>

              {index < 2 ? (
                <ArrowRightIcon
                  aria-hidden="true"
                  className="mt-2 size-4 rotate-90 text-muted-foreground/40 md:hidden"
                />
              ) : null}
            </li>
          ))}
        </ol>

        {steps.length > 3 ? (
          <ul className="mt-12 grid gap-4 border-t border-border pt-10 sm:grid-cols-2">
            {steps.slice(3).map((step) => (
              <li key={step.id} className="rounded-[var(--radius)] border border-border bg-white p-6">
                <h3 className="font-medium text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">{step.summary}</p>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-14 flex justify-center">
          <Button href="/safety-guide" size="lg">
            Read the full safety guide
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <p className="mt-6 text-center text-sm leading-6 text-foreground-muted">
          If a fire is spreading or there is smoke you cannot see through, leave and call{" "}
          <Link href="tel:101" className="font-medium text-primary underline-offset-4 hover:underline">
            101
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
