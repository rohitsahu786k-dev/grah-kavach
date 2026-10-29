import { Manrope, Mukta } from "next/font/google";
import "./landing.css";

/*
 * The site body font is Manrope at 400/500 and has no Devanagari. Landing pages
 * are in Hindi and use heavier weights, so they load Mukta for the script and
 * Manrope 600-800 for numerals, buttons and the countdown, on these routes only.
 */
const mukta = Mukta({
  variable: "--font-lp-mukta",
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-lp-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

/** Fonts and base styles shared by /book-now and every /lp/<slug> page. */
export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div lang="hi" className={`${mukta.variable} ${manrope.variable} lp-root`}>
      {children}
    </div>
  );
}
