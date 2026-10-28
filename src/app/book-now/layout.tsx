import { Manrope, Mukta } from "next/font/google";
import "./landing.css";

/*
 * The site body font is Manrope at 400/500 and has no Devanagari. The landing
 * page is in Hindi and uses heavier weights, so it loads Mukta for the script
 * and Manrope 600-800 for numerals, buttons and the countdown, for this route
 * only.
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

export default function BookNowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div lang="hi" className={`${mukta.variable} ${manrope.variable} lp-root`}>
      {children}
    </div>
  );
}
