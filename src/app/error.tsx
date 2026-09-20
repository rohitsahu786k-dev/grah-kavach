"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-6 py-20 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-danger">Data unavailable</p>
        <h1 className="mt-3 text-4xl font-medium text-foreground">We cannot load this page right now</h1>
        <p className="mt-4 text-muted-foreground">
          {error.message || "The backend did not return a usable response."}
        </p>
        <button className="mt-8 min-h-11 bg-primary px-5 text-sm font-medium text-primary-foreground" type="button" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
