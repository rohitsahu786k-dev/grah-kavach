import { getImageProps } from "next/image";
import { BannerCarousel, type BannerSlide } from "./banner-carousel";
import type { Media } from "@/types";

type BannerLink = { label: string; url: string };

type Props = {
  desktop: Media[];
  mobile: Media[];
  links: BannerLink[];
  autoplaySeconds: number | null;
};

/*
 * Server half of the hero carousel.
 *
 * `getImageProps` is used rather than <Image> because desktop and mobile get
 * genuinely different artwork — art direction, not just a different size. It
 * gives us the optimizer's `srcSet` for each file, which we hand to a
 * <picture> so the browser downloads only the set that matches the viewport.
 * Rendering both and hiding one with CSS would download both.
 *
 * The interactive shell is a client component; everything it needs is plain
 * serialisable props computed here.
 */

const FALLBACK_RATIO = "16 / 9";

function ratioOf(media: Media | undefined): string {
  if (!media?.width || !media?.height) return FALLBACK_RATIO;
  return `${media.width} / ${media.height}`;
}

function normalizeHref(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("http") || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed}`;
}

export function HeroBanners({ desktop, mobile, links, autoplaySeconds }: Props) {
  const count = Math.max(desktop.length, mobile.length);
  if (count === 0) return null;

  const slides: BannerSlide[] = [];

  for (let position = 0; position < count; position += 1) {
    // Either list may be shorter. A missing mobile banner falls back to the
    // desktop artwork rather than leaving a hole in the carousel.
    const desktopMedia = desktop[position] ?? mobile[position];
    const mobileMedia = mobile[position] ?? desktop[position];

    if (!desktopMedia?.url || !mobileMedia?.url) continue;

    const common = {
      alt: mobileMedia.alt || desktopMedia.alt || "",
      sizes: "100vw",
      // Only the first banner is above the fold on every screen size.
      priority: position === 0,
      loading: position === 0 ? ("eager" as const) : ("lazy" as const),
    };

    const desktopProps = getImageProps({
      ...common,
      src: desktopMedia.url,
      width: desktopMedia.width ?? 1920,
      height: desktopMedia.height ?? 1080,
    }).props;

    const {
      // Dropped: we set our own alt and our own sizing styles below.
      alt: _alt,
      style: _style,
      ...mobileProps
    } = getImageProps({
      ...common,
      src: mobileMedia.url,
      width: mobileMedia.width ?? 1080,
      height: mobileMedia.height ?? 1080,
    }).props;

    void _alt;
    void _style;

    const link = links[position];

    slides.push({
      key: `${desktopMedia.id || desktopMedia.url}-${position}`,
      alt: common.alt,
      href: link ? normalizeHref(link.url) : null,
      linkLabel: link?.label ?? "",
      mobileRatio: ratioOf(mobileMedia),
      desktopRatio: ratioOf(desktopMedia),
      img: mobileProps,
      desktopSrcSet: desktopProps.srcSet,
      desktopSizes: desktopProps.sizes,
    });
  }

  if (slides.length === 0) return null;

  return <BannerCarousel slides={slides} autoplaySeconds={autoplaySeconds} label="Graha Kavach banners" />;
}
