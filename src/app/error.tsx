"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[color:var(--bg)] px-5">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
          Error
        </p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-[color:var(--ink)] md:text-3xl">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
          We hit a temporary issue rendering this page. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
