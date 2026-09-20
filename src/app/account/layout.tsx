"use client";

import { usePathname } from "next/navigation";
import { AccountNav } from "@/components/account/account-nav";
import { useCustomer } from "@/lib/auth/use-customer";
import Link from "next/link";
import { type ReactNode } from "react";

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { customer, isLoading } = useCustomer();

  const isAuthPage =
    pathname === "/account/login" || pathname === "/account/register";

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-stone-50/50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="h-8 w-48 animate-pulse rounded bg-stone-200" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[256px_1fr]">
            <div className="h-64 animate-pulse rounded-2xl bg-white" />
            <div className="h-96 animate-pulse rounded-2xl bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main className="min-h-screen bg-stone-50/50 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-stone-100 text-stone-500">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 className="mt-4 text-2xl font-medium text-foreground">Sign In Required</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Please log in to your Graha Kavach customer account to access your orders, delivery addresses, and profile.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/account/login"
              className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs hover:bg-primary/90"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/account/register"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-6 py-2.5 text-sm font-medium text-foreground hover:bg-stone-50"
            >
              Create an Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50/50 py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">My Account</span>
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
          <AccountNav />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}
