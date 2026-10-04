import type { Metadata } from "next";
import { AccountShell } from "@/components/account/account-shell";

// Private area: sign-in, orders, addresses. Never for search results.
export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <AccountShell>{children}</AccountShell>;
}
