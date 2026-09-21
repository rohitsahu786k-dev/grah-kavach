import { Container } from "@/components/ui/container";
import { FeatureCarousel, type FeatureSlide } from "./feature-carousel";
import type { Media } from "@/types";

type Props = {
  title: string;
  intro: string;
  images: Media[];
  autoplaySeconds: number | null;
};

/**
 * Server half of the mid-page carousel: resolves the optimizer props once and
 * hands plain data to the interactive shell. Renders nothing until images are
 * added in WordPress, so the page never shows an empty band.
 */
export function FeatureCarouselSection({ title, intro, images, autoplaySeconds }: Props) {
  const sourceImages: Media[] = images.length
    ? images
    : [
        {
          id: -101,
          url: "/home/kitchen-kit-lifestyle.png",
          alt: "Graha Kavach fire safety kit in a modern kitchen",
          width: 1792,
          height: 1024,
        },
        {
          id: -102,
          url: "/home/risk-zones-editorial.png",
          alt: "Home fire risk zones including kitchen, electrical panel and inverter",
          width: 1792,
          height: 1024,
        },
        {
          id: -103,
          url: "/home/placement-installation.png",
          alt: "Fire safety products mounted in a modern home",
          width: 1792,
          height: 1024,
        },
        {
          id: -104,
          url: "/home/udaipur-quality-workshop.png",
          alt: "Quality check workspace for fire safety products",
          width: 1456,
          height: 1024,
        },
      ];

  const slides: FeatureSlide[] = sourceImages
    .filter((image) => Boolean(image?.url))
    .map((image, position) => ({
      key: `${image.id || image.url}-${position}`,
      src: image.url,
      alt: image.alt || "",
      width: image.width ?? 1200,
      height: image.height ?? 700,
      ratio: image.width && image.height ? `${image.width} / ${image.height}` : "16 / 9",
    }));

  if (slides.length === 0) return null;

  return (
    <section className="overflow-hidden bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="mx-auto max-w-2xl text-center">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
            Home readiness carousel
          </p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            {title || "Built for the moments that matter."}
          </h2>
          <p className="mt-4 leading-7 text-foreground-muted">
            {intro ||
              "Swipe through the kit, the risk zones and the placement story before you decide where it belongs at home."}
          </p>
        </div>
      </Container>

      {/* Full-bleed on purpose: the peeking slides need the whole viewport. */}
      <div className="mt-10">
        <FeatureCarousel
          slides={slides}
          autoplaySeconds={autoplaySeconds ?? 5}
          label={title || "Home readiness"}
        />
      </div>
    </section>
  );
}
