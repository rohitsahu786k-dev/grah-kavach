"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useCustomer } from "@/lib/auth/use-customer";
import { cn } from "@/lib/utils/cn";
import { PhoneLoginForm } from "./phone-login-form";

type Method = "phone" | "email";

const TABS: Array<{ id: Method; label: string }> = [
  { id: "email", label: "Login with Email" },
  { id: "phone", label: "Login with Phone" },
];

function EmailLoginForm({
  onSuccess,
  registerHref,
  onNavigate,
}: {
  onSuccess?: () => void;
  registerHref: string;
  onNavigate?: () => void;
}) {
  const { login } = useCustomer();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  const field =
    "min-h-[48px] w-full rounded-[var(--radius)] border border-border-strong bg-background px-3 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="gk-email" className="mb-1.5 block text-sm font-medium text-foreground">
          Email address
        </label>
        <input
          id="gk-email"
          data-autofocus
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          value={email}
          disabled={busy}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="gk-password" className="mb-1.5 block text-sm font-medium text-foreground">
          Password
        </label>
        <div className="relative flex items-center">
          <input
            id="gk-password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            disabled={busy}
            onChange={(e) => setPassword(e.target.value)}
            className={cn(field, "pr-10")}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 p-1 text-stone-400 hover:text-stone-700"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius)] bg-foreground px-4 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {busy ? "Signing in..." : "Login"}
      </button>

      <p className="text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link href={registerHref} onClick={onNavigate} className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}

/** Phone OTP and email/password login behind two tabs. Shared by the popup and /account/login. */
export function LoginTabs({
  onSuccess,
  registerHref = "/account/register",
  onNavigate,
}: {
  onSuccess?: () => void;
  registerHref?: string;
  onNavigate?: () => void;
}) {
  const [method, setMethod] = useState<Method>("email");

  return (
    <div>
      <div role="tablist" aria-label="Login method" className="mb-5 grid grid-cols-2 rounded-[var(--radius)] bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`gk-tab-${tab.id}`}
            aria-selected={method === tab.id}
            aria-controls={`gk-panel-${tab.id}`}
            onClick={() => setMethod(tab.id)}
            className={cn(
              "min-h-[40px] rounded-[calc(var(--radius)-2px)] px-2 text-sm font-medium transition-colors",
              method === tab.id
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`gk-panel-${method}`} aria-labelledby={`gk-tab-${method}`}>
        {method === "phone" ? (
          <PhoneLoginForm onSuccess={onSuccess} />
        ) : (
          <EmailLoginForm onSuccess={onSuccess} registerHref={registerHref} onNavigate={onNavigate} />
        )}
      </div>
    </div>
  );
}
