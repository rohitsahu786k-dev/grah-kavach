import type { Metadata } from "next";

// Transactional page: useful to the customer, worthless in search results.
export const metadata: Metadata = {
  title: "Track your order",
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
