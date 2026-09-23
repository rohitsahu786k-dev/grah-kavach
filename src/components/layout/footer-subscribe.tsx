"use client";

import { useState } from "react";
import { ArrowRight, Mail, Megaphone, Percent, ShieldCheck } from "lucide-react";

/*
 * Footer sign-up.
 *
 * Posts to the /api/contact endpoint so the address lands in the Inquiries list.
 */
export function FooterSubscribe() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || state === "sending") return;

    setState("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter subscriber",
          email: email.trim(),
          subject: "Newsletter signup",
          message: "Requested product and safety updates from the website footer.",
        }),
      });

      if (!response.ok) throw new Error("failed");
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-4 w-full">
      {state === "done" ? (
        <p role="status" className="rounded-lg bg-green-50 p-2.5 text-xs font-medium text-green-700">
          Thanks — we have your address and will be in touch!
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="relative w-full">
          <div className="flex w-full items-center rounded-xl border border-gray-200/90 bg-white p-1 shadow-xs transition-shadow focus-within:border-gray-400">
            <Mail className="ml-2.5 size-4 shrink-0 text-gray-400" />
            <label htmlFor="footer-email" className="sr-only">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email Address"
              className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 outline-none"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="flex shrink-0 items-center gap-1 rounded-lg bg-gradient-to-r from-[#d92212] via-[#e63920] to-[#f95738] px-3.5 py-2 text-[11px] font-bold tracking-wider text-white uppercase shadow-xs transition-opacity hover:opacity-95 disabled:opacity-60"
            >
              {state === "sending" ? "..." : "SUBSCRIBE"}
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          {state === "error" ? (
            <p role="alert" className="mt-2 text-xs text-red-600">
              Something went wrong. Please try again.
            </p>
          ) : null}
        </form>
      )}

      {/* 3 micro-badges: fully responsive with flex-wrap */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-gray-100/80 pt-3">
        <div className="flex items-center gap-1.5">
          <Megaphone className="size-3.5 text-[#e63920] shrink-0" />
          <span className="text-[11px] leading-tight text-gray-600">Product Updates</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Percent className="size-3.5 text-[#e63920] shrink-0" />
          <span className="text-[11px] leading-tight text-gray-600">Exclusive Offers</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-[#e63920] shrink-0" />
          <span className="text-[11px] leading-tight text-gray-600">Safety Guidance</span>
        </div>
      </div>
    </div>
  );
}
