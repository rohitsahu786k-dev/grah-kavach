import { BookingRoute, bookingMetadata } from "@/components/landing/landing-routes";

export const metadata = bookingMetadata;

export const revalidate = 300;

export default function BookNowDetailsPage() {
  return <BookingRoute slug="book-now" />;
}
