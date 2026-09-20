import { cn } from "@/lib/utils/cn";
import { FlameIcon } from "./icons";

const aspects = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-[16/9]",
  portrait: "aspect-[4/5]",
  wide: "aspect-[21/9]",
} as const;

type Props = {
  /** What belongs here, e.g. "Kitchen Safety Image". Shown on the block. */
  label: string;
  aspect?: keyof typeof aspects;
  className?: string;
};

/**
 * A deliberate, labelled gap in the art direction.
 *
 * Several sections of this page call for photography the brand has not shot
 * yet — lifestyle, risk areas, installation. Rather than fill them with stock
 * imagery nobody approved, or with a product render that does not exist, the
 * layout reserves the exact space and names the shot that goes in it.
 *
 * Every one of these carries `data-placeholder`, so the full set is findable
 * with a single search when the photography arrives.
 */
export function MediaPlaceholder({ label, aspect = "4/3", className }: Props) {
  return (
    <div
      data-placeholder="true"
      role="img"
      aria-label={`Placeholder for ${label}`}
      className={cn(
        "relative flex flex-col items-center justify-center gap-3 overflow-hidden rounded-[var(--radius)]",
        "border border-dashed border-border-strong bg-background-subtle px-5 text-center",
        aspects[aspect],
        className,
      )}
    >
      <span className="grid size-10 place-items-center rounded-full bg-white text-secondary">
        <FlameIcon className="size-5" />
      </span>
      <span className="max-w-[22ch] text-sm leading-5 font-medium text-foreground-muted">
        {label}
      </span>
      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        Image to be supplied
      </span>
    </div>
  );
}
