import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-[60svh] max-w-3xl place-items-center px-6 py-20 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">404</p>
        <h1 className="mt-3 text-4xl font-medium text-foreground">Page not found</h1>
        <p className="mt-4 text-muted-foreground">
          The requested page or product is not available.
        </p>
        <Link className="mt-8 inline-flex min-h-11 items-center bg-primary px-5 text-sm font-medium text-primary-foreground" href="/">
          Go home
        </Link>
      </div>
    </main>
  );
}
