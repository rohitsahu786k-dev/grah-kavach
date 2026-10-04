"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { useCustomer } from "@/lib/auth/use-customer";
import { cn } from "@/lib/utils/cn";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

function friendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  if (code.includes("invalid-phone-number")) return "Enter a valid 10-digit mobile number.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please try again after some time.";
  if (code.includes("invalid-verification-code")) return "Incorrect OTP. Please check and try again.";
  if (code.includes("code-expired")) return "This OTP has expired. Please request a new one.";
  if (code.includes("network")) return "Network problem. Check your connection and try again.";
  if (code.includes("billing") || code.includes("quota")) return "OTP service is busy right now. Please try again later.";
  return error instanceof Error && !code ? error.message : "Something went wrong. Please try again.";
}

const primaryButton =
  "flex min-h-[48px] w-full items-center justify-center rounded-[var(--radius)] bg-foreground px-4 text-sm font-medium text-white transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:bg-stone-300";

/**
 * Mobile-number login with a Firebase SMS OTP. Used by both the popup sheet and
 * the /account/login page.
 */
export function PhoneLoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const { loginWithPhone } = useCustomer();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const confirmation = useRef<ConfirmationResult | null>(null);
  const verifier = useRef<RecaptchaVerifier | null>(null);
  const recaptchaHost = useRef<HTMLDivElement>(null);
  const submittedOtp = useRef("");

  useEffect(() => {
    return () => {
      verifier.current?.clear();
      verifier.current = null;
    };
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const sendOtp = useCallback(async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      verifier.current?.clear();
      // A fresh element each time: reCAPTCHA cannot be re-rendered into a used node.
      const host = recaptchaHost.current;
      if (host) host.innerHTML = "";
      const mount = document.createElement("div");
      host?.appendChild(mount);
      verifier.current = new RecaptchaVerifier(auth, mount, { size: "invisible" });

      confirmation.current = await signInWithPhoneNumber(auth, `+91${phone}`, verifier.current);
      submittedOtp.current = "";
      setOtp("");
      setStep("otp");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      verifier.current?.clear();
      verifier.current = null;
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }, [phone]);

  const verifyOtp = useCallback(
    async (code: string) => {
      if (!confirmation.current || code.length !== OTP_LENGTH || submittedOtp.current === code) return;
      submittedOtp.current = code;
      setBusy(true);
      setError(null);
      try {
        const result = await confirmation.current.confirm(code);
        const idToken = await result.user.getIdToken();
        await loginWithPhone(idToken);
        onSuccess?.();
      } catch (err) {
        submittedOtp.current = "";
        setError(friendlyError(err));
      } finally {
        setBusy(false);
      }
    },
    [loginWithPhone, onSuccess],
  );

  // Android Chrome can read the SMS and fill the code itself (Web OTP API).
  useEffect(() => {
    if (step !== "otp" || !("OTPCredential" in window)) return;
    const abort = new AbortController();
    navigator.credentials
      .get({ otp: { transport: ["sms"] }, signal: abort.signal } as CredentialRequestOptions)
      .then((credential) => {
        const code = (credential as { code?: string } | null)?.code;
        if (code) {
          setOtp(code);
          void verifyOtp(code);
        }
      })
      .catch(() => {});
    return () => abort.abort();
  }, [step, verifyOtp]);

  return (
    <div>
      {step === "phone" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendOtp();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="gk-phone" className="mb-1.5 block text-sm font-medium text-foreground">
              Mobile number
            </label>
            <div className="flex min-h-[48px] overflow-hidden rounded-[var(--radius)] border border-border-strong bg-background focus-within:border-primary">
              <span className="flex items-center border-r border-border-strong bg-muted px-3 text-sm text-foreground-muted">
                +91
              </span>
              <input
                id="gk-phone"
                data-autofocus
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="Enter mobile number"
                value={phone}
                maxLength={10}
                disabled={busy}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="min-w-0 flex-1 bg-transparent px-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}

          <button type="submit" disabled={busy || phone.length !== 10} className={primaryButton}>
            {busy ? "Sending OTP..." : "Get OTP"}
          </button>
        </form>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verifyOtp(otp);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="gk-otp" className="mb-1.5 block text-sm font-medium text-foreground">
              Enter the 6-digit OTP sent to +91 {phone}
            </label>
            <input
              id="gk-otp"
              data-autofocus
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="······"
              value={otp}
              maxLength={OTP_LENGTH}
              disabled={busy}
              onChange={(e) => {
                const next = e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH);
                setOtp(next);
                if (next.length === OTP_LENGTH) void verifyOtp(next);
              }}
              className="min-h-[48px] w-full rounded-[var(--radius)] border border-border-strong bg-background px-3 text-center text-xl tracking-[0.5em] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {error ? <p role="alert" className="text-xs text-danger">{error}</p> : null}

          <button type="submit" disabled={busy || otp.length !== OTP_LENGTH} className={primaryButton}>
            {busy ? "Verifying..." : "Verify & Login"}
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setError(null);
              }}
              className="text-muted-foreground underline hover:text-foreground"
            >
              Change number
            </button>
            <button
              type="button"
              disabled={cooldown > 0 || busy}
              onClick={() => void sendOtp()}
              className={cn("font-medium", cooldown > 0 ? "text-muted-foreground" : "text-primary hover:underline")}
            >
              {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}

      <div ref={recaptchaHost} />

      <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground">
        By continuing, you accept our{" "}
        <Link href="/privacy-policy" className="underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
