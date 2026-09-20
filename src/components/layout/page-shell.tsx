export function PageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <main>
      <section className="border-b border-stone-200 bg-stone-50 py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          {eyebrow ? (
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 max-w-3xl text-4xl font-medium text-stone-950">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-3xl text-lg leading-8 text-stone-700">
              {description}
            </p>
          ) : null}
        </div>
      </section>
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">{children}</div>
      </section>
    </main>
  );
}
