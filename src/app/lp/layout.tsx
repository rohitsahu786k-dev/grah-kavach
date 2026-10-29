import { LandingShell } from "@/components/landing/landing-shell";

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <LandingShell>{children}</LandingShell>;
}
