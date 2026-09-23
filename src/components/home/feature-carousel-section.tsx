import { Container } from "@/components/ui/container";
import { FeatureCarousel, type FeatureSlide } from "./feature-carousel";
import type { Media } from "@/types";

type Props = {
  title: string;
  intro: string;
  images: Media[];
  autoplaySeconds: number | null;
};

export function FeatureCarouselSection({ title, intro, images, autoplaySeconds }: Props) {
  if (images.length === 0) return null;

  const slides: FeatureSlide[] = images
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
          {title ? (
            <h2 className="text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              {title}
            </h2>
          ) : null}
          {intro ? <p className="mt-4 leading-7 text-foreground-muted">{intro}</p> : null}
        </div>
      </Container>

      {/* Full-bleed on purpose: the peeking slides need the whole viewport. */}
      <div className="mt-10">
        <FeatureCarousel
          slides={slides}
          autoplaySeconds={autoplaySeconds}
          label={title || "Featured"}
        />
      </div>
    </section>
  );
}
