"use client";

import { Suspense, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomer } from "@/lib/auth/use-customer";
import { PhoneLoginForm } from "@/components/auth/phone-login-form";
import { brandAssets } from "@/lib/config/brand";

function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/account";
  // Only same-site paths: an absolute URL here would be an open redirect.
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/account";
  const { customer, isLoading } = useCustomer();

  useEffect(() => {
    if (!isLoading && customer) router.push(redirect);
  }, [customer, isLoading, redirect, router]);

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-stone-50/50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-white shadow-xs">
        <div className="relative hidden w-[46%] md:block">
          <Image
            src="/cta/cta-mobile.png"
            alt=""
            fill
            sizes="(min-width: 768px) 440px, 0px"
            className="object-cover object-bottom"
          />
        </div>

        <div className="flex-1 px-6 py-10 sm:px-10 md:py-14">
          <div className="mx-auto w-full max-w-sm">
            <Image
              src={brandAssets.logo.url}
              alt={brandAssets.logo.alt}
              width={brandAssets.logo.width}
              height={brandAssets.logo.height}
              className="mb-5 h-10 w-auto"
            />
            <h1 className="text-xl font-medium text-foreground">Login / Sign up</h1>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">
              Verify your mobile number with a one-time password.
            </p>
            <PhoneLoginForm onSuccess={() => router.push(redirect)} />
          </div>
        </div>
      </div>
    </main>
  );
}

/* useSearchParams() needs a Suspense boundary for the route to prerender. */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-md px-4 py-16">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-64 animate-pulse rounded-[var(--radius)] bg-muted" />
        </main>
      }
    >
      <LoginPanel />
    </Suspense>
  );
}
