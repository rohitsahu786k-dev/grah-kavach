import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Join class names, resolving conflicting Tailwind utilities so that a
 * `className` passed by a caller always wins over a component's own default.
 * Without the merge step, `class="px-4"` and `class="px-6"` both survive and
 * the winner depends on stylesheet order rather than intent.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
