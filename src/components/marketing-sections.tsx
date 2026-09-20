import { fallbackHomeContent } from "@/lib/wordpress/content-fallbacks";

export function MarketingSections() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 md:grid-cols-3 lg:px-10">
        {fallbackHomeContent.productEducation.map((section) => (
          <article
            className="rounded-lg border border-stone-200 bg-stone-50 p-6"
            key={section.title}
          >
            <h2 className="text-xl font-medium text-stone-950">
              {section.title}
            </h2>
            <p className="mt-3 leading-7 text-stone-600">{section.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
