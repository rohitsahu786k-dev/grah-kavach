import { Button } from "@/components/ui/button";

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white px-6 py-20 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-stone-100 text-stone-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="21" r="1" />
          <circle cx="19" cy="21" r="1" />
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
        </svg>
      </div>

      <h2 className="mt-6 text-2xl font-medium text-foreground">
        Your Cart is Empty
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        Equip your home, office, or vehicle with India&apos;s certified fire safety essentials. Add the complete kit or browse safety equipment.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Button href="/fire-safety-kit" size="lg">
          View Fire Safety Kit
        </Button>
        <Button href="/shop" variant="outline" size="lg">
          Browse All Products
        </Button>
      </div>
    </div>
  );
}
