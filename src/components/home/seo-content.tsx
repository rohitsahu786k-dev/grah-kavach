"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils/cn";
import { ChevronDown } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Section 14 — homepage SEO copy, just above the footer               */
/*                                                                     */
/* Long-form, keyword-rich text for search engines and for anyone who  */
/* scrolls this far wanting the full picture — not shown to inflate    */
/* the page, so it is collapsed behind "Read more" by default rather   */
/* than dumped in full above the footer. Everything in it is already   */
/* true elsewhere on the site (the manufacturer, the certifications,   */
/* the product specs, the emergency numbers): this section restates it */
/* for search intent, it does not introduce new claims.                */
/* ------------------------------------------------------------------ */

export function HomeSeoContent() {
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-background py-16 lg:py-20">
      <Container width="wide">
        <h2 className="text-2xl leading-[1.2] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-3xl">
          Home Fire Safety Kit in Udaipur, Rajasthan
        </h2>

        <div className="relative mt-5">
          <div
            className={cn(
              "gk-prose overflow-hidden text-[15px] leading-7 text-foreground-muted",
              !open && "max-h-[280px]",
            )}
          >
            <p>
              Graha Kavach is a 3-in-1 home fire safety kit designed, manufactured and sold from
              Udaipur, Rajasthan — a 2 kg ABC dry powder fire extinguisher, an automatic fire
              extinguisher ball, and a fire blanket, packed together with the hardware to mount all
              three. If you have been searching for a fire extinguisher price in Udaipur, a fire
              safety kit for your apartment, or a complete home fire safety kit online in India,
              this is built to answer that search directly: one order, three tools, covering the
              fire risks an ordinary Indian home or small shop actually faces — a stovetop
              flare-up, a short circuit at the electrical panel, or a fire that starts small and
              needs to be controlled before it spreads.
            </p>

            <h3>Why an Udaipur home needs a fire safety kit</h3>
            <p>
              Udaipur&apos;s older city homes with dense, aging wiring and its newer apartment
              blocks running air conditioners, inverters and kitchen appliances off a single
              distribution board share the same weak point: an electrical panel or MCB box that
              rarely gets a second look until something goes wrong. Add a kitchen where an LPG
              cylinder, hot oil and cotton or synthetic fabric all sit within arm&apos;s reach of
              each other, and the two most common domestic fire risks in any Rajasthan home are
              already present before anyone has thought about buying a fire extinguisher. A fire
              safety kit for home use in Udaipur is not about a rare event — its whole point is
              that when a pan catches fire or a plug point sparks, the right tool is already
              mounted on the wall instead of being something you wish you had ordered last week.
            </p>

            <h3>Made in Udaipur — not just sold here</h3>
            <p>
              Most fire safety kits listed online are shipped in from somewhere else. Graha Kavach
              is manufactured by Speciality Geochem, based in Udaipur, Rajasthan, working in the
              region since 2010. That matters for two practical reasons: replacement parts,
              refills and support questions are answered by people working in the same state, not
              a call centre reading from a script; and buying fire safety equipment made in
              Udaipur keeps the manufacturing and the after-sales relationship in the same place.
              For a Rajasthan-based household or small business searching for a fire extinguisher
              supplier near Udaipur, or a fire safety kit made in Rajasthan rather than resold from
              elsewhere, this is that product.
            </p>

            <h3>What&apos;s inside the kit</h3>
            <p>
              A 2 kg ABC dry powder fire extinguisher with a pressure gauge, built for roughly
              10–12 seconds of continuous discharge with a 3–4 metre throw — enough to knock down a
              small electrical, liquid or solid-material fire before it spreads. This is the
              extinguisher a household reaches for when the fire is visible, small, and there is a
              clear way to approach it. An automatic fire extinguisher ball, mounted on its stand
              near a known risk point such as an electrical panel, an inverter cupboard or a
              workshop corner, activates on direct flame contact and releases a non-toxic
              extinguishing powder — useful specifically because it works whether or not anyone is
              in the room when a fire starts. A 1 m × 1 m fire blanket, sized for one job:
              smothering a stovetop or pan fire by cutting off its air supply, which is the correct
              response to a cooking-oil fire and the wrong one for water. All of it comes with a
              wall bracket, mounting stand, screws and wall plugs, so none of it needs a separate
              trip to a hardware store in Udaipur before it can actually go up on a wall.
            </p>

            <h3>Extinguisher, fire ball or blanket — which one do you reach for?</h3>
            <p>
              When the fire is visible, small, and there is a clear path to reach it, the ABC dry
              powder extinguisher is the right first move — pull the pin, aim at the base, squeeze
              the lever, sweep side to side. When the risk is somewhere nobody is standing — an
              inverter cupboard, the space above an MCB box, a workshop corner with old wiring —
              the automatic fire ball is the tool built for that gap, because it does not need a
              person present to activate. Reaching for water on a cooking-oil or electrical fire is
              one of the most common mistakes in a kitchen: water sinks under burning oil and can
              throw it back out as a flare-up. That is specifically the situation the fire blanket
              is for — cover the pan, cut off the oxygen, and leave it covered until it has cooled.
              None of the three replaces the other two; each covers a different kind of small fire,
              which is why the kit ships as a set rather than as a single extinguisher.
            </p>

            <h3>A basic fire safety checklist for your Udaipur home</h3>
            <ul>
              <li>
                Open the electrical panel or MCB box once a month and check for scorch marks,
                loose wiring or a burning smell — the earliest warning most homes ever get.
              </li>
              <li>
                Keep the fire blanket beside the stove, not across the room from it — a step you
                have to take toward the fire to grab your extinguisher defeats the point.
              </li>
              <li>
                Mount the automatic fire ball near the inverter, the electrical panel, or wherever
                else in the house nobody is usually standing when something goes wrong.
              </li>
              <li>
                Check the extinguisher&apos;s pressure gauge once a month — the needle should sit
                in the green zone, not the red.
              </li>
              <li>
                Know the route out of every room before you need it, and agree with the household
                on where everyone meets outside.
              </li>
              <li>
                Save 101 and 112 in every phone in the house, not just one — the person nearest the
                door is usually the one who makes the call.
              </li>
            </ul>
            <p>
              None of this is specific to Udaipur — it applies to a home fire safety routine
              anywhere in Rajasthan or India — but it is worth repeating locally, because a
              checklist read once during setup and never looked at again is not a checklist,
              it is a memory.
            </p>

            <h3>Fire safety equipment delivered across Rajasthan and India</h3>
            <p>
              Graha Kavach ships online to addresses across Rajasthan — Udaipur, Jaipur, Jodhpur,
              Kota, Ajmer, Bikaner, Bhilwara, Chittorgarh, Alwar and the rest of the state — and to
              the rest of India through the same online store. Whether the search that brought you
              here was &ldquo;fire extinguisher online Rajasthan,&rdquo; &ldquo;fire safety kit for
              home India,&rdquo; or &ldquo;ABC fire extinguisher near me,&rdquo; the kit is ordered
              the same way: entirely online, from a manufacturer with an existing base in Udaipur.
              Priority for the brand is Udaipur first, because that is where the product is built
              and tested; but a home fire safety kit is exactly the kind of product that should not
              be limited by geography, so the same 3-in-1 kit — extinguisher, fire ball, fire
              blanket — ships to homes, apartments, PG accommodations, shops and offices across
              Rajasthan and pan-India.
            </p>

            <h3>Who this kit is for</h3>
            <p>
              Independent houses in Udaipur&apos;s older neighbourhoods with dated wiring.
              Apartments running an inverter, AC units and kitchen appliances off one distribution
              board. Rented flats and PG accommodation, where a fire blanket by the stove and a
              compact extinguisher by the door cost less than a single hospital visit would. Small
              shops, godowns and home-based workshops anywhere in Rajasthan with an electrical panel
              that never gets a second look. Offices with a pantry and a server or inverter room.
              None of these are unusual situations — they describe most homes and small businesses
              in Udaipur, across Rajasthan, and across urban and semi-urban India.
            </p>

            <h3>Fire safety kit price in Udaipur and India</h3>
            <p>
              A single kit price covers three separate tools that would otherwise be bought
              individually, plus the wall bracket, mounting stand and fixings needed to actually
              install them — most standalone fire extinguisher listings do not include any of
              that. Rather than repeat a number here that changes with active offers, the current
              price, any ongoing discount and stock availability are shown above, in the purchase
              section of this same page. What stays constant regardless of the number on a given
              day: one ABC extinguisher, one automatic fire ball, one fire blanket, full mounting
              hardware and a printed safety guide, from a manufacturer based in Udaipur.
            </p>

            <h3>Quality and certification</h3>
            <p>
              Graha Kavach&apos;s manufacturing is backed by ISO 9001:2015 (quality management),
              ISO 14001:2015 (environmental management) and ISO 45001:2018 (occupational health and
              safety) certification, alongside CE marking and testing coordinated through the
              National Test House, Government of India. These are not decoration — a fire safety
              product is only as trustworthy as the process that built it, and that process is
              disclosed on this site alongside the actual certificate images, rather than left as
              an unverified badge.
            </p>

            <h3>Know these two numbers</h3>
            <p>
              A fire safety kit is a first response, not a replacement for the fire department. If
              a fire is spreading, or there is smoke thick enough that you cannot see through it,
              leave the building and call{" "}
              <Link href="tel:101" className="font-medium text-primary underline-offset-4 hover:underline">
                101
              </Link>{" "}
              (Fire) or{" "}
              <Link href="tel:112" className="font-medium text-primary underline-offset-4 hover:underline">
                112
              </Link>{" "}
              (India&apos;s unified emergency number) immediately. Everything in the Graha Kavach
              kit — the extinguisher, the fire ball, the blanket — is built for the small,
              early-stage fire: the pan flare-up, the spark at a plug point, the moment before it
              becomes something that needs a fire truck.
            </p>

            <p>
              Search &ldquo;fire safety kit Udaipur,&rdquo; &ldquo;buy fire extinguisher online
              Rajasthan,&rdquo; or &ldquo;home fire safety kit India,&rdquo; and the objective is
              the same either way: a 3-in-1 kit that is manufactured in Udaipur, certified, and
              ready to mount the day it arrives — in Udaipur first, across Rajasthan next, and
              anywhere else in India after that.
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
