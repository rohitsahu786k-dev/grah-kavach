import { LandingPageRoute, landingMetadata } from "@/components/landing/landing-routes";

// The first campaign page. Others live at /lp/<slug>; both are driven by WordPress.
export const revalidate = 300;

export const generateMetadata = () => landingMetadata("book-now");

export default function BookNowPage() {
  return <LandingPageRoute slug="book-now" />;
}
