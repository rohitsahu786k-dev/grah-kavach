"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  categories: Array<{
    name: string;
    slug: string;
    count?: number | null;
  }>;
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "all";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/blog"
        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
          activeCategory === "all"
            ? "bg-primary text-white shadow-sm"
            : "border border-border bg-white text-foreground-muted hover:border-primary/40 hover:text-foreground"
        }`}
      >
        All Articles
      </Link>

      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;
        return (
          <Link
            key={cat.slug}
            href={`/blog?category=${cat.slug}`}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              isActive
                ? "bg-primary text-white shadow-sm"
                : "border border-border bg-white text-foreground-muted hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {cat.name}
            {cat.count ? (
              <span className="ml-1.5 opacity-60">({cat.count})</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
