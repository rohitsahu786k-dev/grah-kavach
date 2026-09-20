"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/ui/icons";
import { useToast } from "@/components/ui/toast";
import { useWishlist } from "@/lib/wishlist/wishlist-context";
import { cn } from "@/lib/utils/cn";

type Props = {
  productId: number;
  productName?: string;
  /** "icon" for a floating heart on a card, "inline" for a labelled control. */
  variant?: "icon" | "inline";
  className?: string;
};

/*
 * Save / unsave a product.
 *
 * It is a real <button> with aria-pressed, not a styled div, so a screen
 * reader announces the saved state and the keyboard can operate it. The label
 * says what the next press will do, which is what a button label is for.
 */
export function WishlistButton({
  productId,
  productName = "this product",
  variant = "icon",
  className,
}: Props) {
  const { has, toggle, isReady, syncState } = useWishlist();
  const { notify } = useToast();
  const [pulse, setPulse] = useState(false);

  const saved = isReady && has(productId);

  function handleClick() {
    const nowSaved = toggle(productId);

    if (nowSaved) {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 360);
    }

    notify(
      nowSaved ? `Saved ${productName} to your wishlist.` : `Removed ${productName} from your wishlist.`,
      nowSaved ? "success" : "neutral",
    );
  }

  const label = saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`;

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={label}
        disabled={syncState === "loading"}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius)] border px-4 text-sm font-medium transition-colors",
          saved
            ? "border-primary bg-primary-subtle text-primary"
            : "border-border-strong bg-background text-foreground hover:border-primary hover:bg-primary-subtle",
          "disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
      >
        <HeartIcon
          filled={saved}
          className={cn("size-[18px] shrink-0", pulse && "gk-anim-pop")}
        />
        {saved ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      disabled={syncState === "loading"}
      className={cn(
        "grid size-10 place-items-center rounded-full border border-border bg-white/90 transition-colors",
        saved ? "text-primary" : "text-muted-foreground hover:text-primary",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
    >
      <HeartIcon filled={saved} className={cn("size-[18px]", pulse && "gk-anim-pop")} />
    </button>
  );
}
