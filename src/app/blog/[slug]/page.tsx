import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronRight, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/wordpress/adapters";
import { stripHtml, calculateReadingTime, formatIndianDate } from "@/lib/wordpress/format";
import { ShareButtons } from "@/components/blog/share-buttons";
import { BlogCard } from "@/components/blog/blog-card";

import { buildSeoMetadata } from "@/lib/seo/metadata";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/seo/structured-data";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found | Graha Kavach",
    };
  }

  const cleanTitle = stripHtml(post.title);
  const cleanExcerpt = stripHtml(post.excerpt) || cleanTitle;
  const featuredImgUrl = post.featuredImage?.node?.sourceUrl;

  return buildSeoMetadata({
    seo: post.seo,
    fallbackTitle: `${cleanTitle} | Graha Kavach Safety Guide`,
    fallbackDescription: cleanExcerpt,
    path: `/blog/${post.slug}`,
    fallbackImage: featuredImgUrl,
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const cleanTitle = stripHtml(post.title);
  const primaryCategory = post.categories?.nodes[0];
  const categoryName = primaryCategory?.name || "Safety Guide";
  const categorySlug = primaryCategory?.slug || "safety-guides";
  const formattedDate = formatIndianDate(post.date);
  const readingTime = calculateReadingTime(post.content);
  const featuredImgUrl = post.featuredImage?.node?.sourceUrl;

  const relatedPosts = await getRelatedPosts(categorySlug, post.slug, 3);

  const articleSchema = buildArticleSchema({
    title: cleanTitle,
    excerpt: stripHtml(post.excerpt),
    slug: post.slug,
    date: post.date,
    image: featuredImgUrl,
  });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    ...(primaryCategory ? [{ name: categoryName, path: `/blog?category=${categorySlug}` }] : []),
    { name: cleanTitle, path: `/blog/${post.slug}` },
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [articleSchema, breadcrumbSchema],
  };

  return (
    <article className="bg-background py-10 md:py-16">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
            <li>
              <Link href="/" className="transition hover:text-foreground">
                Home
              </Link>
            </li>
            <li>
              <ChevronRight className="h-3 w-3 text-foreground-muted/60" />
            </li>
            <li>
              <Link href="/blog" className="transition hover:text-foreground">
                Blog
              </Link>
            </li>
            {primaryCategory && (
              <>
                <li>
                  <ChevronRight className="h-3 w-3 text-foreground-muted/60" />
                </li>
                <li>
                  <Link
                    href={`/blog?category=${categorySlug}`}
                    className="transition hover:text-foreground"
                  >
                    {categoryName}
                  </Link>
                </li>
              </>
            )}
            <li>
              <ChevronRight className="h-3 w-3 text-foreground-muted/60" />
            </li>
            <li className="font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
              {cleanTitle}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="border-b border-border pb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/blog?category=${categorySlug}`}
              className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-primary/20"
            >
              {categoryName}
            </Link>
            <span className="text-foreground-muted text-xs">•</span>
            <span className="inline-flex items-center gap-1 text-xs text-foreground-muted">
              <Clock className="h-3.5 w-3.5" />
              {readingTime}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-tight">
            {cleanTitle}
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-subtle text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Graha Kavach Fire Safety Team
                </p>
                <div className="flex items-center gap-1.5 text-xs text-foreground-muted">
                  <Calendar className="h-3 w-3" />
                  <time dateTime={post.date}>{formattedDate}</time>
                </div>
              </div>
            </div>

            <ShareButtons
              title={cleanTitle}
              url={`https://grahakavach.in/blog/${post.slug}`}
            />
          </div>
        </header>

        {/* Featured Image if supplied */}
        {featuredImgUrl && (
          <div className="relative mt-8 h-72 w-full overflow-hidden rounded-2xl border border-border sm:h-96">
            <Image
              src={featuredImgUrl}
              alt={post.featuredImage?.node?.altText || cleanTitle}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Reading UX / Article Body */}
        <div className="mt-10">
          <div
            className="prose prose-stone max-w-none dark:prose-invert
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
              prose-h2:mt-10 prose-h2:text-2xl prose-h2:border-b prose-h2:border-border prose-h2:pb-3
              prose-h3:mt-8 prose-h3:text-xl
              prose-p:text-base prose-p:leading-8 prose-p:text-foreground-muted
              prose-li:text-base prose-li:leading-7 prose-li:text-foreground-muted
              prose-strong:text-foreground prose-strong:font-semibold
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-background-subtle prose-blockquote:py-2 prose-blockquote:px-5 prose-blockquote:italic
              prose-ol:my-4 prose-ul:my-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Author / Verification Footer Card */}
        <div className="mt-12 rounded-xl border border-border bg-background-subtle p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white p-3 shadow-xs text-primary">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Verified Technical Direction
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-foreground-muted">
                This guide was prepared in accordance with official Indian fire safety standards, chemical specifications from Speciality Geochem Udaipur, and the Graha Kavach Home Safety Manual. Always adhere to evacuation-first principles in an active fire.
              </p>
            </div>
          </div>
        </div>

        {/* Social Share Bar at Bottom */}
        <div className="mt-8 flex items-center justify-between border-y border-border py-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground-muted transition hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Guides
          </Link>
          <ShareButtons
            title={cleanTitle}
            url={`https://grahakavach.in/blog/${post.slug}`}
          />
        </div>

        {/* Product Promo Banner */}
        <div className="mt-12 rounded-2xl bg-primary p-6 text-white sm:p-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Early-Stage Fire Protection
              </span>
              <h3 className="mt-2 text-xl font-bold">
                Equip Your Home with Graha Kavach
              </h3>
              <p className="mt-1 text-xs text-primary-subtle max-w-md">
                Get the complete 3-in-1 kit: 2kg ABC Extinguisher, Automatic Fire Ball, and 550°C Fire Blanket for ₹2,499.
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/checkout"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 text-xs font-bold text-primary shadow transition hover:bg-stone-100"
              >
                Order Kit Today
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 border-t border-border pt-12">
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Related Safety Articles
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((related) => (
                <BlogCard key={related.id} post={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
