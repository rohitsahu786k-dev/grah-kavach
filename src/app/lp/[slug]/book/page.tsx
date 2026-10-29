import { permanentRedirect } from "next/navigation";
import { BookingRoute, bookingMetadata } from "@/components/landing/landing-routes";
import { DEFAULT_LANDING_SLUG } from "@/lib/landing/routes";

export const metadata = bookingMetadata;

export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

export default async function LandingBookingPage({ params }: Props) {
  const { slug } = await params;
  if (slug === DEFAULT_LANDING_SLUG) permanentRedirect("/book-now/details");

  return <BookingRoute slug={slug} />;
}
