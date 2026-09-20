"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCustomer } from "@/lib/auth/use-customer";
import { Field, Input } from "@/components/ui/form";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";
  const { customer, register, isLoading } = useCustomer();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      router.push(redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-stone-50/50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 shadow-xs sm:p-10">
        <div className="text-center">
          <span className="inline-flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
            Create Customer Account
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Track equipment shipments, save delivery addresses, and download tax invoices
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First Name" required>
              {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                <Input
                  id={id}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  disabled={submitting}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  required
                />
              )}
            </Field>

            <Field id="lastName" label="Last Name" required>
              {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
                <Input
                  id={id}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  disabled={submitting}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                  required
                />
              )}
            </Field>
          </div>

          <Field id="email" label="Email Address" required>
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={submitting}
                aria-describedby={describedBy}
                aria-invalid={invalid}
                required
              />
            )}
          </Field>

          <Field id="phone" label="Mobile Phone (India)" hint="For courier delivery coordination">
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <div className="relative flex items-center">
                <span className="pointer-events-none absolute left-3.5 text-sm font-medium text-stone-500">
                  +91
                </span>
                <Input
                  id={id}
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="pl-12 font-mono tracking-wider"
                  disabled={submitting}
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
              </div>
            )}
          </Field>

          <Field id="password" label="Password" hint="At least 6 characters" required>
            {({ id, "aria-describedby": describedBy, "aria-invalid": invalid }) => (
              <Input
                id={id}
                type="password"
                autoComplete="new-password"
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
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href={`/account/login${redirect !== "/account" ? `?redirect=${encodeURIComponent(redirect)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}

/* See the login page: useSearchParams() needs a Suspense boundary to prerender. */
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-md px-4 py-16">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-8 h-80 animate-pulse rounded-[var(--radius)] bg-muted" />
        </main>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
