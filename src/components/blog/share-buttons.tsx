"use client";

import { useState } from "react";
import { MessageSquare, Share2, Check, Copy } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? window.location.href : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          url: fullUrl,
        });
      } catch {
        // Ignored if cancelled
      }
    } else {
      handleCopy();
    }
  };

  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mr-1">
        Share:
      </span>

      {/* WhatsApp */}
      <a
        href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
      >
        <MessageSquare className="h-3.5 w-3.5" />
        WhatsApp
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-subtle"
      >
        X / Twitter
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-subtle"
      >
        LinkedIn
      </a>

      {/* Copy link */}
      <button
        onClick={handleCopy}
        aria-label="Copy article link"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-background-subtle"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-foreground-muted" />
            Copy Link
          </>
        )}
      </button>

      {/* Native Web Share button if supported */}
      <button
        onClick={handleNativeShare}
        aria-label="Open system share"
        className="inline-flex items-center gap-1 rounded-md bg-background-subtle p-1.5 text-foreground-muted transition hover:text-foreground sm:hidden"
      >
        <Share2 className="h-4 w-4" />
      </button>
    </div>
  );
}
