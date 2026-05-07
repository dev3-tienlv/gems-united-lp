import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[color:var(--bg)] px-5">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-[color:var(--ink)] md:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          The page you are looking for has moved or no longer exists.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
