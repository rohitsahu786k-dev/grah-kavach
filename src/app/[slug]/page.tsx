import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { buildSeoMetadata } from "@/lib/seo/metadata";
import { getCmsPages, getPageBySlug, isReservedPageSlug } from "@/lib/wordpress/adapters";

/*
 * Catch-all route for WordPress pages.
 *
 * This is what makes the policy pages CMS-driven: privacy, refund, shipping,
 * terms and cancellation are ordinary WordPress pages, and publishing one is
 * all it takes for `/its-slug` to resolve and for a footer link to appear.
 * Nothing about them is hard-coded here.
 *
 * Next resolves static segments before dynamic ones, so `/cart`, `/about` and
 * every other real route still wins over this file. Slugs that do have their
 * own route are refused here as well, so the CMS copy of "home" can never
 * shadow the actual homepage.
 */

export const revalidate = 3600;

/** Next passes route params as a promise in the App Router. */
type CmsPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const pages = await getCmsPages();
  return pages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;

  if (isReservedPageSlug(slug)) return {};

  const page = await getPageBySlug(slug);
  if (!page) return {};

  return buildSeoMetadata({
    seo: page.seo,
    fallbackTitle: page.title,
    fallbackDescription: "",
    path: `/${slug}`,
  });
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  if (isReservedPageSlug(slug)) notFound();

  const page = await getPageBySlug(slug);

  if (!page) notFound();

  return (
    <main className="bg-background">
      <Container width="default" className="py-10 lg:py-16">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="transition-colors hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground">{page.title}</li>
          </ol>
        </nav>

        <header className="mt-5 border-b border-border pb-6">
          <p className="text-xs font-medium tracking-[0.18em] text-primary uppercase">Policy</p>
          <h1 className="mt-3 text-3xl leading-[1.15] font-medium tracking-[-0.02em] text-balance text-foreground lg:text-[42px]">
            {page.title}
          </h1>
        </header>

        {/*
         * Styling is applied to the CMS HTML through descendant selectors
         * rather than a typography plugin, so the rendered policy follows the
         * same type scale, spacing and link colour as the rest of the site
         * without adding a dependency for one route.
         */}
        <div
          className={[
            "mt-8 max-w-[72ch] text-[15px] leading-7 text-foreground-muted lg:text-base lg:leading-8",
            "[&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-foreground lg:[&_h2]:text-2xl",
            "[&_h3]:mt-8 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-foreground",
            "[&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-medium [&_h4]:text-foreground",
            "[&_p]:mt-4",
            "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-5",
            "[&_li]:mt-2 [&_li]:pl-1",
            "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary-hover",
            "[&_strong]:font-medium [&_strong]:text-foreground",
            "[&_blockquote]:mt-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border-strong [&_blockquote]:pl-4",
            "[&_hr]:my-8 [&_hr]:border-border",
            "[&_img]:mt-5 [&_img]:rounded-[var(--radius)]",
            // Wide policy tables must scroll rather than push the page sideways.
            "[&_table]:mt-5 [&_table]:block [&_table]:w-full [&_table]:overflow-x-auto",
            "[&_td]:border [&_td]:border-border [&_td]:p-2.5 [&_th]:border [&_th]:border-border [&_th]:p-2.5 [&_th]:text-left [&_th]:font-medium [&_th]:text-foreground",
          ].join(" ")}
          dangerouslySetInnerHTML={{ __html: page.content ?? "" }}
        />
      </Container>
    </main>
  );
}
