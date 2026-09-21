import Image from "next/image";
import { Container } from "@/components/ui/container";
import { ShieldIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import type { Media } from "@/types";

/* ------------------------------------------------------------------ */
/* Section 9 — brand story                                             */
/* ------------------------------------------------------------------ */

/**
 * Who makes this, and where.
 *
 * Kept to a few lines. The manufacturer note comes from the CMS so the client
 * can add verified history without a deploy; the fallback says only what the
 * source material supports and nothing more.
 */
export function BrandStory({ notesHtml }: { notesHtml: string | null }) {
  return (
    <section className="bg-background-subtle py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
          <div className="overflow-hidden rounded-[8px] border border-border bg-white shadow-xl shadow-red-950/5">
            <div className="relative aspect-[4/3]">
              <Image
                src="/home/udaipur-quality-workshop.png"
                alt="Quality check workspace for Graha Kavach fire safety products in Udaipur"
                fill
                sizes="(max-width: 1023px) 92vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              Who makes it
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Built by Speciality Geochem, in Udaipur.
            </h2>

            {notesHtml ? (
              <div
                className="mt-5 max-w-xl space-y-4 leading-7 text-foreground-muted [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: notesHtml }}
              />
            ) : (
              <p className="mt-5 max-w-xl leading-7 text-foreground-muted">
                Graha Kavach is made by Speciality Geochem in Udaipur, Rajasthan, a manufacturer
                working in the region since 2010. Further detail is added here as it is verified.
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 10 — quality and certification                              */
/* ------------------------------------------------------------------ */

export type Certification = {
  id: string | number;
  title: string;
  summary: string;
  issuer: string;
  /** Optional: a certificate record may exist before its scan is uploaded. */
  image?: Media | null;
};

/**
 * Certificates, and only real ones.
 *
 * When the CMS holds none, this says so in plain language instead of filling
 * the space with generic quality marks. An invented badge on a fire-safety
 * product is a safety claim, not decoration.
 */
export function Quality({ certifications }: { certifications: Certification[] }) {
  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="max-w-2xl">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
            Quality and certification
          </p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            Verified certificates only.
          </h2>
        </div>

        {certifications.length > 0 ? (
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {certifications.map((cert) => (
              <li
                key={cert.id}
                className="rounded-[var(--radius)] border border-border bg-background-subtle p-6"
              >
                {cert.image?.url ? (
                  <div className="relative h-20 w-full">
                    <Image
                      src={cert.image.url}
                      alt={cert.image.alt || cert.title}
                      fill
                      sizes="240px"
                      className="object-contain object-left"
                    />
                  </div>
                ) : (
                  <span className="grid size-11 place-items-center rounded-full bg-white text-primary">
                    <ShieldIcon className="size-5" />
                  </span>
                )}
                <h3 className="mt-5 font-medium text-foreground">{cert.title}</h3>
                <p className="mt-2 text-sm leading-6 text-foreground-muted">
                  {cert.summary || cert.issuer}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-10 rounded-[var(--radius)] border border-dashed border-border-strong bg-background-subtle p-8">
            <p className="max-w-2xl leading-7 text-foreground-muted">
              Certification documents are published here once they have been verified and uploaded
              to the CMS. Until then this space stays empty rather than showing a mark the product
              has not been awarded.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Section 11 — reviews, or what stands in for them                    */
/* ------------------------------------------------------------------ */

export type Review = {
  id: number;
  reviewer: string;
  rating: number;
  review: string;
};

export type Testimonial = {
  id: number;
  quote: string;
  author: string;
  location: string;
  rating: number | null;
};

/**
 * Social proof — and only when it is real.
 *
 * Two genuine sources, in order of strength: WooCommerce reviews, which are
 * tied to an actual order, then testimonials entered in the CMS. When both are
 * empty the section does not render at all. An empty state here would be an
 * invitation to fill it with something invented, and on a fire-safety product
 * a fabricated endorsement is not a marketing shortcut, it is a safety claim
 * nobody made.
 */
export function ReviewsOrCommitment({
  reviews,
  testimonials = [],
}: {
  reviews: Review[];
  testimonials?: Testimonial[];
}) {
  if (reviews.length > 0) {
    return (
      <section className="bg-background-subtle py-16 lg:py-24">
        <Container width="wide">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">Reviews</p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-foreground lg:text-[42px]">
            What customers say.
          </h2>

          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <li
                key={review.id}
                className="rounded-[var(--radius)] border border-border bg-white p-6"
              >
                <p className="gk-text-gradient text-sm font-medium" aria-label={`Rated ${review.rating} out of 5`}>
                  {review.rating} / 5
                </p>
                <div
                  className="mt-4 leading-7 text-foreground-muted"
                  dangerouslySetInnerHTML={{ __html: review.review }}
                />
                <p className="mt-5 text-sm font-medium text-foreground">{review.reviewer}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    );
  }

  // No reviews and no testimonials: show nothing rather than a placeholder.
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-background-subtle py-16 lg:py-24">
      <Container width="wide">
        <div className="max-w-2xl">
          <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
            Testimonials
          </p>
          <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            What people tell us.
          </h2>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((item) => (
            <li
              key={item.id}
              className="flex flex-col rounded-[var(--radius)] border border-border bg-white p-6"
            >
              {typeof item.rating === "number" && item.rating > 0 ? (
                <p
                  className="text-sm font-medium text-primary"
                  aria-label={`Rated ${item.rating} out of 5`}
                >
                  {item.rating} / 5
                </p>
              ) : null}

              <blockquote className="mt-3 flex-1 leading-7 text-foreground-muted">
                {item.quote}
              </blockquote>

              <figcaption className="mt-5 text-sm">
                {item.author ? (
                  <span className="font-medium text-foreground">{item.author}</span>
                ) : null}
                {item.location ? (
                  <span className="block text-muted-foreground">{item.location}</span>
                ) : null}
              </figcaption>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
