import { permanentRedirect } from "next/navigation";
import { LandingPageRoute, landingMetadata } from "@/components/landing/landing-routes";
import { DEFAULT_LANDING_SLUG } from "@/lib/landing/routes";
import { getLandingSlugs } from "@/lib/wordpress/adapters";

/*
 * Campaign landing pages created under "Landing Pages" in WordPress. Publishing
 * one is all it takes for /lp/<its-slug> to resolve; nothing is hard-coded here.
 */

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getLandingSlugs()).filter((slug) => slug !== DEFAULT_LANDING_SLUG).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return landingMetadata(slug);
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  if (slug === DEFAULT_LANDING_SLUG) permanentRedirect("/book-now");

  return <LandingPageRoute slug={slug} />;
}
