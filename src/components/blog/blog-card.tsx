import Link from "next/link";
import Image from "next/image";
import { Clock, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
import type { WpPost } from "@/lib/wordpress/types";
import { stripHtml, calculateReadingTime, formatIndianDate } from "@/lib/wordpress/format";

interface BlogCardProps {
  post: WpPost;
  featured?: boolean;
}

export function BlogCard({ post, featured = false }: BlogCardProps) {
  const category = post.categories?.nodes[0]?.name || "Safety Guide";
  const readingTime = calculateReadingTime(post.content);
  const formattedDate = formatIndianDate(post.date);
  const cleanTitle = stripHtml(post.title);
  const cleanExcerpt = stripHtml(post.excerpt);

  const featuredImgUrl = post.featuredImage?.node?.sourceUrl;

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:border-primary/40 hover:shadow-md lg:grid lg:grid-cols-12">
        <div className="relative h-64 bg-gradient-to-br from-primary/10 via-primary-subtle to-stone-100 lg:col-span-7 lg:h-full">
          {featuredImgUrl ? (
            <Image
              src={featuredImgUrl}
              alt={post.featuredImage?.node?.altText || cleanTitle}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full min-h-[220px] items-center justify-center p-8 text-primary/40">
              <ShieldCheck className="h-20 w-20" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="rounded-md bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur-sm">
              Featured Guide
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-foreground-muted">
              <span className="font-semibold text-primary">{category}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {readingTime}
              </span>
            </div>

            <h2 className="mt-3 text-xl font-bold tracking-tight text-foreground transition group-hover:text-primary sm:text-2xl">
              <Link href={`/blog/${post.slug}`}>
                {cleanTitle}
              </Link>
            </h2>

            <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-foreground-muted">
              {cleanExcerpt}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <span className="text-xs font-medium text-foreground-muted">
              By Graha Kavach Team
            </span>
            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-primary transition hover:gap-2"
            >
              Read Full Article
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-white shadow-sm transition hover:border-primary/40 hover:shadow-md">
      <div>
        <div className="relative h-48 w-full bg-gradient-to-br from-background-subtle to-stone-100">
          {featuredImgUrl ? (
            <Image
              src={featuredImgUrl}
              alt={post.featuredImage?.node?.altText || cleanTitle}
              fill
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-primary/30">
              <ShieldCheck className="h-12 w-12" />
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="rounded-md bg-white/90 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-xs backdrop-blur-xs">
              {category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {readingTime}
            </span>
          </div>

          <h3 className="mt-2 text-base font-bold tracking-tight text-foreground transition group-hover:text-primary">
            <Link href={`/blog/${post.slug}`}>
              {cleanTitle}
            </Link>
          </h3>

          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-foreground-muted">
            {cleanExcerpt}
          </p>
        </div>
      </div>

      <div className="border-t border-border p-4 pt-3 flex items-center justify-between">
        <span className="text-[11px] text-foreground-muted">
          Fire Safety Guide
        </span>
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary transition hover:gap-1.5"
        >
          Read Guide
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </article>
  );
}
