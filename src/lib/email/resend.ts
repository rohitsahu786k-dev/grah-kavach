import "server-only";

import { serverEnv } from "@/lib/env";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

/** Escapes user-supplied text for safe use inside an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Sends one email through Resend's REST API. Never throws: email is a
 * side-effect and must not break the request that triggered it. Returns
 * whether Resend accepted the message.
 */
export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailInput): Promise<boolean> {
  const env = serverEnv();
  if (!env.RESEND_API_KEY) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.RESEND_FROM,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error("Resend rejected email:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (error) {
    console.error("Resend request failed:", error);
    return false;
  }
}
