"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomer } from "@/lib/auth/use-customer";
import { Field, Input } from "@/components/ui/form";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { customer, login, isLoading } = useCustomer();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && customer) {
      router.push(redirect);
    }
  }, [customer, isLoading, redirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please provide both email and password.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await login(username.trim(), password);
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid credentials.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-stone-50/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-xs sm:p-10">
        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Sign In to Graha Kavach
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Manage your fire safety equipment orders and deliveries
          </p>
        </div>

        {error ? (
          <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-danger">
            <svg className="mt-0.5 size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Field id="username" label="Email Address or Username" required>
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                type="text"
                autoComplete="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@example.com"
                disabled={submitting}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required
              />
            )}
          </Field>

          <Field id="password" label="Password" required>
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={submitting}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required
              />
            )}
          </Field>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {submitting ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Don&apos;t have an account yet?{" "}
          <Link
            href={`/account/register${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </main>
  );
}

/*
 * useSearchParams() opts the subtree into client-side rendering, so it has to
 * sit under a Suspense boundary for the route to prerender at all. The
 * fallback mirrors the form's outer shell so the page does not jump when the
 * real form takes over.
 */
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
      <LoginForm />
    </Suspense>
  );
}
