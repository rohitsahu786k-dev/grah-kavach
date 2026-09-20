import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import type { Media } from "@/types";

type Props = {
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  kitImage: Media | null;
  /** Extinguisher, ball, blanket — the three parts, shown small under the kit. */
  partImages: Media[];
  trustItems: string[];
};

/*
 * The hero.
 *
 * The fallback hero, shown only when no banners have been uploaded to the CMS.
 * It sits below the header like any other section — the header is solid on
 * every route now, so nothing here needs to clear it. The warm wash behind it
 * is the only gradient on the page above the footer, and it is light enough
 * that the H1 keeps full contrast against it.
 */
export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  kitImage,
  partImages,
  trustItems,
}: Props) {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Background wash. Decorative, so it is hidden from assistive tech. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_40rem_at_88%_-10%,rgba(248,192,0,0.13),transparent_60%),radial-gradient(48rem_32rem_at_8%_0%,rgba(224,24,32,0.07),transparent_58%)]"
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 pt-12 pb-14 xs:px-5 lg:grid lg:min-h-[92svh] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:gap-14 lg:px-8 lg:pt-16 lg:pb-20 xl:gap-20 xl:px-10">
        <div className="max-w-xl lg:max-w-none">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">{eyebrow}</p>

          <h1 className="mt-5 text-[34px] leading-[1.1] font-medium tracking-[-0.025em] text-balance text-foreground xs:text-[38px] lg:text-[56px] xl:text-[64px]">
            {title}
          </h1>

          <p className="mt-5 max-w-xl text-[17px] leading-8 text-foreground-muted lg:mt-6 lg:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
            <Button href={primaryCta.href} size="lg">
              {primaryCta.label}
              <ArrowRightIcon className="size-4" />
            </Button>
            <Button href={secondaryCta.href} variant="outline" size="lg">
              {secondaryCta.label}
            </Button>
          </div>

          {trustItems.length > 0 ? (
            <ul className="mt-9 grid gap-2.5 border-t border-border pt-6 sm:grid-cols-2 lg:mt-10">
              {trustItems.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-foreground-muted">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {/* Product composition. Below the copy on a phone, beside it from lg. */}
        <div className="mt-12 lg:mt-0">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-x-2 -top-4 bottom-10 rounded-[20px] bg-background-subtle lg:-inset-x-6 lg:-top-8"
            />

            <div className="relative overflow-hidden rounded-[var(--radius)] border border-border bg-white p-3 shadow-[0_1px_2px_rgba(26,26,26,0.04)] lg:p-5">
              {kitImage?.url ? (
                <div className="relative aspect-[16/9] w-full lg:aspect-[16/10]">
                  <Image
                    src={kitImage.url}
                    alt={kitImage.alt || "The complete Graha Kavach fire safety kit"}
                    fill
                    // The largest image above the fold: loaded eagerly so it is
                    // the LCP element rather than a late swap.
                    priority
                    fetchPriority="high"
                    sizes="(max-width: 1023px) 92vw, 52vw"
                    className="object-contain"
                  />
                </div>
              ) : (
                <MediaPlaceholder label="Homepage Kit Composition" aspect="16/9" />
              )}
            </div>

            {partImages.length > 0 ? (
              <ul className="relative mt-3 grid grid-cols-3 gap-3">
                {partImages.slice(0, 3).map((image) => (
                  <li
                    key={image.url}
                    className="relative aspect-square overflow-hidden rounded-[var(--radius)] border border-border bg-white p-2"
                  >
                    <Image
                      src={image.url}
                      alt={image.alt || ""}
                      fill
                      sizes="(max-width: 1023px) 30vw, 17vw"
                      className="object-contain p-1.5"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
