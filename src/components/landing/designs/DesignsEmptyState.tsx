import Link from "next/link";

interface DesignsEmptyStateProps {
  text: string;
  ctaLabel: string;
}

export function DesignsEmptyState({ text, ctaLabel }: DesignsEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-14 text-center md:px-10">
      <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm10 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM3 20l6.5-6.5a1 1 0 0 1 1.4 0l2.6 2.6 3.1-3.1a1 1 0 0 1 1.4 0L21 16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </span>
      <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[color:var(--muted)] md:text-base">
        {text}
      </p>
      <Link
        href="/#contact"
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
