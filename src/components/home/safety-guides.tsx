import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { SafetyCarousel, type SafetySlide } from "./safety-carousel";

export type GuideStep = {
  id: string | number;
  title: string;
  summary: string;
  slug?: string;
};

type Props = {
  guides?: GuideStep[];
  slides?: SafetySlide[];
};

export function SafetyGuides({ guides: _guides, slides }: Props) {
  return (
    <section className="bg-background-subtle py-10 lg:py-14">
      <Container width="default">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
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

        <SafetyCarousel slides={slides} />

        <div className="mt-14 flex justify-center">
          <Button href="/safety-guide" size="lg">
            Read the full safety guide
            <ArrowRightIcon className="size-4" />
          </Button>
        </div>

        <p className="mt-6 text-center text-sm leading-6 text-foreground-muted">
          None of this replaces the fire department. Evacuate first, then call{" "}
          <Link href="tel:101" className="font-medium text-primary underline-offset-4 hover:underline">
            101
          </Link>{" "}
          or{" "}
          <Link href="tel:112" className="font-medium text-primary underline-offset-4 hover:underline">
            112
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
