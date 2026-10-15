"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Section 14 — homepage SEO copy, just above the footer               */
/*                                                                     */
/* Long-form text for search engines and for anyone who scrolls this   */
/* far wanting the full picture. Collapsed behind "Read more" by       */
/* default rather than dumped in full above the footer.                */
/* ------------------------------------------------------------------ */

const linkClass =
  "font-medium text-primary underline underline-offset-4 hover:text-primary-hover";

export function HomeSeoContent() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-background py-16 lg:py-20">
      <Container width="wide">
        <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-3xl">
          Fire Extinguisher for Home in India: Why a 3-in-1 Fire Safety Kit Is the Smarter Choice
        </h2>

        <div className="relative mt-5">
          <div
            className={cn(
              "gk-prose overflow-hidden text-[15px] leading-7 text-foreground-muted",
              !open && "max-h-[280px]",
            )}
          >
            <p>
              Most house fires in India start small: an LPG stove flare-up, an overloaded socket, a
              short circuit in the electrical panel. In the first minute, the right tool decides
              whether it stays a scare or becomes a loss. That is why a fire extinguisher for home use
              is no longer a &ldquo;nice to have&rdquo;. But a single extinguisher does not cover every
              risk in a house.
            </p>

            <h3>Why one extinguisher is not enough</h3>
            <p>
              A 2 kg ABC dry powder extinguisher is the most practical fire extinguisher for house use.
              It handles small fires involving solids like wood and cloth, liquids like oil and
              petrol, and gases like LPG, and most adults can lift it easily. But it discharges for
              roughly 10-12 seconds, someone has to be present to use it, and burning oil in a pan is
              better smothered than sprayed. Our guide to the{" "}
              <Link href="/blog/types-of-fire-extinguishers" className={linkClass}>
                types of fire extinguishers
              </Link>{" "}
              explains where ABC, DCP and CO2 differ.
            </p>

            <h3>The three layers of a home fire response</h3>
            <p>
              The Graha Kavach{" "}
              <Link href="/fire-safety-kit" className={linkClass}>
                3-in-1 fire safety kit for home
              </Link>{" "}
              combines three tools, each with its own job:
            </p>
            <ul>
              <li>
                <strong>Manual ABC fire extinguisher:</strong> for small, contained fires when you are
                home and it is safe to approach.
              </li>
              <li>
                <strong>Automatic fire ball:</strong> placed near an electrical panel, gas cylinder
                area or store room, it releases powder when flame reaches it. It needs no electricity
                and no one to operate it.
              </li>
              <li>
                <strong>Fire blanket (1 m x 1 m):</strong> among the most useful kitchen fire safety
                tools. Cover a small pan fire and cut off its oxygen. Never use water on burning oil.
              </li>
            </ul>
            <p>
              Because every piece has a clear role, even family members who have never used an
              extinguisher can act quickly. You can read{" "}
              <Link href="/how-it-works" className={linkClass}>
                how the fire ball works
              </Link>{" "}
              before you buy.
            </p>

            <h3>Why a kit works better than buying separately</h3>
            <p>
              Buying three products from three sellers means three deliveries, mismatched fixings and
              guesswork about placement. A ready kit removes that. Everything arrives in one box, with
              the bracket, stand, screws and wall plugs needed to mount it, so your fire safety kit for
              home can be on the wall the same day it arrives. Our{" "}
              <Link href="/blog/fire-extinguisher-for-home-buying-guide-india" className={linkClass}>
                buying guide
              </Link>{" "}
              lists what to check before you pay.
            </p>

            <h3>What the best household fire extinguisher setup looks like</h3>
            <ul>
              <li>
                <strong>Right class:</strong> ABC powder suits mixed household risks.
              </li>
              <li>
                <strong>Right size:</strong> 2 kg is compact enough to mount and lift quickly.
              </li>
              <li>
                <strong>Right placement:</strong> visible, on your exit route, never behind the hazard.
              </li>
              <li>
                <strong>Right accessories:</strong> a wall bracket, fire ball stand, screws and wall
                plugs, all included in the box.
              </li>
              <li>
                <strong>Right checks:</strong> look at the pressure gauge and condition every month.
              </li>
            </ul>

            <h3>Where to keep each item</h3>
            <p>
              Mount the extinguisher in a common area or corridor, on the way out. Keep the fire ball
              near the electrical panel, gas cylinder or store room. Keep the blanket within reach of
              the kitchen, not directly above the stove. Our{" "}
              <Link href="/safety-guide" className={linkClass}>
                home fire safety guide
              </Link>{" "}
              covers placement and what to do in the first minute of a fire.
            </p>

            <h3>Made in India, delivered across India</h3>
            <p>
              Graha Kavach kits are manufactured by Speciality Geochem in Udaipur, Rajasthan, and
              delivered across India, from metros to smaller towns. It suits flats, independent houses
              and shops alike. Delivery is free, and you can book with Rs 199 on Cash on Delivery and
              pay the remaining Rs 2,300 on arrival. Learn more{" "}
              <Link href="/about" className={linkClass}>
                about us
              </Link>{" "}
              or{" "}
              <Link href="/contact" className={linkClass}>
                contact our team
              </Link>{" "}
              before you order.
            </p>
          </div>

          {!open ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent"
            />
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          {open ? "Show less" : "Read more"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </Container>
    </section>
  );
}
