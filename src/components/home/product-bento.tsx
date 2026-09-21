import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon, CheckIcon, FlameIcon, ShieldIcon } from "@/components/ui/icons";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { cn } from "@/lib/utils/cn";
import type { Media } from "@/types";

export type BentoItem = {
  name: string;
  role: string;
  description: string;
  image: Media | null;
  placeholderLabel: string;
};

type Props = {
  heroImage: Media | null;
  items: BentoItem[];
  pieceCount: number;
};

export function ProductBento({ heroImage, items, pieceCount }: Props) {
  const [first, second, third] = items;
  const proof = [
    ["Manual action", "Extinguisher"],
    ["Auto response", "Fire ball"],
    ["Kitchen control", "Fire blanket"],
  ];

  return (
    <section className="bg-background py-16 lg:py-24">
      <Container width="wide">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-end">
          <div className="max-w-2xl">
            <p className="gk-text-gradient text-xs font-medium tracking-[0.18em] uppercase">
              The protection system
            </p>
            <h2 className="mt-4 text-3xl leading-[1.14] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
              Three products. One calm first response.
            </h2>
            <p className="mt-4 leading-7 text-foreground-muted">
              Built like a layered safety wardrobe for the home: one piece you use by hand, one
              that waits near risk, and one that smothers kitchen flame.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {proof.map(([title, text]) => (
              <div
                key={title}
                className="rounded-[8px] border border-border bg-background-subtle p-4"
              >
                <CheckIcon className="size-4 text-primary" />
                <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
                <p className="mt-1 text-xs leading-5 text-foreground-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid auto-rows-[280px] grid-cols-1 gap-4 md:grid-cols-3">
          <article className="group relative flex flex-col justify-end overflow-hidden rounded-[8px] bg-foreground p-8 text-white md:col-span-2 md:row-span-2 lg:p-10">
            <Image
              src="/home/kitchen-kit-lifestyle.png"
              alt=""
              fill
              sizes="(max-width: 767px) 92vw, 60vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            {heroImage?.url ? (
              <Image
                src={heroImage.url}
                alt=""
                width={360}
                height={260}
                sizes="(max-width: 767px) 48vw, 22vw"
                className="absolute right-4 bottom-4 z-10 hidden max-h-56 w-auto object-contain drop-shadow-2xl lg:block"
              />
            ) : null}

            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/5"
            />

            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <ShieldIcon className="size-4 text-secondary" />
                One kit, three responses
              </span>

              <h3 className="text-3xl leading-[1.1] font-medium tracking-[-0.02em] lg:text-5xl">
                Cover the fire
                <br />
                you can reach and the one you cannot.
              </h3>

              <p className="max-w-md text-white/85 lg:text-lg">
                Packed together with bracket, stand and fixings, so the kit looks ready from the
                day it reaches home.
              </p>

              <Link
                href="/fire-safety-kit"
                className="inline-flex min-h-11 items-center gap-2 pt-1 text-sm font-medium text-white underline-offset-4 hover:underline"
              >
                View the full kit
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </article>

          <article className="relative flex flex-col justify-between overflow-hidden rounded-[8px] bg-primary p-8 text-primary-foreground">
            <div
              aria-hidden="true"
              className="absolute -top-8 -right-8 size-32 rounded-full bg-white/20 blur-2xl"
            />
            <div className="relative z-10">
              <p className="text-5xl leading-none font-medium tabular-nums">{pieceCount}</p>
              <p className="mt-2 text-sm tracking-[0.14em] text-white/80 uppercase">
                pieces in the box
              </p>
            </div>
            <p className="relative z-10 text-sm leading-6 text-white/85">
              Extinguisher, fire ball and blanket, plus every fixing needed to mount them.
            </p>
          </article>

          {[first, second, third].filter(Boolean).map((item, index) => (
            <article
              key={item.name}
              className={cn(
                "group flex flex-col justify-between overflow-hidden rounded-[8px] border border-border bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-950/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                index === 2 && "md:col-span-1",
              )}
            >
              <div className="relative h-28 w-full">
                {item.image?.url ? (
                  <Image
                    src={item.image.url}
                    alt={item.image.alt || item.name}
                    fill
                    sizes="240px"
                    className="object-contain object-left transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                ) : (
                  <MediaPlaceholder label={item.placeholderLabel} aspect="4/3" />
                )}
              </div>

              <div className="space-y-1.5">
                <p className="flex items-center gap-1.5 text-xs font-medium tracking-[0.14em] text-secondary uppercase">
                  <FlameIcon className="size-3.5" />
                  {item.role}
                </p>
                <h4 className="text-lg leading-6 font-medium text-foreground">{item.name}</h4>
                <p className="line-clamp-3 text-sm leading-6 text-foreground-muted">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
