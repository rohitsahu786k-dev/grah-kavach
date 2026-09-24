import Image from "next/image";
import { Container } from "@/components/ui/container";
import type { Media } from "@/types";

/*
 * Certification marks, as a marquee.
 *
 * Layout from the 21st.dev "Logo Cloud Marquee" block: the track is the list
 * rendered twice inside a `w-max` flex row, translated -50% on a linear loop,
 * with an edge fade applied through a `mask-image` gradient and the animation
 * paused on hover. Those three details are what make it read as continuous
 * rather than as a strip that restarts.
 *
 * Kept as-is; only the palette and the type are ours. The duplicated half is
 * hidden from assistive technology so a screen reader hears each mark once.
 */

export type CertificationLogo = {
  id: string | number;
  title: string;
  image?: Media | null;
};

export function CertificationMarquee({
  title,
  certifications,
}: {
  title: string;
  certifications: CertificationLogo[];
}) {
  const withLogos = certifications.filter((item) => Boolean(item.image?.url));

  if (withLogos.length === 0) return null;

  const track = [...withLogos, ...withLogos];

  return (
    <section className="bg-background-subtle py-8 lg:py-10">
      <Container width="wide">
        <p className="text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
          {title}
        </p>

        <div className="gk-marquee-mask relative mt-6 overflow-hidden">
          <div className="gk-marquee-track flex w-max items-center">
            {track.map((item, index) => {
              const duplicate = index >= withLogos.length;

              return (
                <div
                  key={`${item.id}-${index}`}
                  aria-hidden={duplicate ? "true" : undefined}
                  className="flex shrink-0 items-center px-8 lg:px-12"
                >
                  <Image
                    src={item.image!.url}
                    alt={duplicate ? "" : item.image!.alt || item.title}
                    width={item.image!.width ?? 160}
                    height={item.image!.height ?? 160}
                    className="h-14 w-auto object-contain lg:h-16"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
