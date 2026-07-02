// Server-only: pulls translations from messages.ts (which itself imports
// "server-only"). Do not import these card components from a "use client"
// file — it will fail the build. Pass already-rendered card JSX as children
// from a server component instead, or expose a thin client wrapper.
import "server-only";

import Image from "next/image";
import Link from "next/link";
import { gemsLetterGradients } from "@/lib/gems-accents";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { resolveCareerFields } from "@/lib/career-locale";
import { formatEmploymentType } from "@/lib/employment-type";
import type { BlogItem, CareerItem, ValueItem } from "@/types/landing";

export function ValueCard({ item }: { item: ValueItem }) {
  const accent = gemsLetterGradients[item.shortCode] ?? gemsLetterGradients.G;
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[color:var(--brand)]/55 bg-[color:var(--surface)] p-4 md:p-7 transition hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_22px_48px_rgba(25,12,52,0.12)]">
      <span
        className="pointer-events-none absolute -right-2 -top-2 select-none font-display text-[110px] font-black leading-none tracking-tighter opacity-[0.08] transition group-hover:opacity-[0.18] md:-right-4 md:-top-4 md:text-[180px]"
        style={{
          background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          color: "transparent",
        }}
        aria-hidden="true"
      >
        {item.shortCode}
      </span>
      <div className="relative">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl font-display text-lg font-extrabold text-white shadow-[0_10px_24px_rgba(111,66,201,0.25)] md:h-12 md:w-12 md:rounded-2xl md:text-2xl"
          style={{
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
          }}
        >
          {item.shortCode}
        </span>
        <h3 className="mt-3 font-display text-base font-extrabold text-[color:var(--ink)] md:mt-6 md:text-xl">
          {item.title}
        </h3>
        <p className="mt-1.5 min-h-[56px] text-[13px] leading-5 text-[color:var(--muted)] md:mt-2 md:min-h-[72px] md:text-sm md:leading-6">
          {item.description}
        </p>
        <div
          className="mt-2 h-1 w-10 rounded-full md:mt-auto md:w-12"
          style={{
            background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
          }}
          aria-hidden="true"
        />
      </div>
    </article>
  );
}

export function CareerCard({ item, locale }: { item: CareerItem; locale: Locale }) {
  const text = getMessages(locale);
  const { location } = resolveCareerFields(item, locale);
  const employmentLabel = formatEmploymentType(item.type, locale);
  return (
    <Link
      href={`/careers/${item.slug || item.id}`}
      prefetch={false}
      className="group relative block aspect-square overflow-hidden rounded-3xl border-2 border-[color:var(--brand)] bg-[color:var(--soft)] focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)]"
      aria-label={`${text.cards.hiring} ${item.title}`}
    >
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center transition duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)] text-white">
          <span className="font-display text-3xl font-extrabold">
            {item.title.split(" ")[0]}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--overlay-deep)]/85 via-[color:var(--overlay-deep)]/30 to-transparent" />

      <div className="absolute left-3 top-3 md:left-5 md:top-5">
        <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--accent)] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white md:gap-1.5 md:px-3 md:text-[10px] md:tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {text.cards.hiring}
        </span>
      </div>

      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 md:inset-x-5 md:bottom-5 md:gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/80 md:text-[11px] md:tracking-wider">
            {location} · {employmentLabel}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-[15px] font-extrabold leading-tight text-white md:text-lg">
            {item.title}
          </h3>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[color:var(--surface)] text-[color:var(--ink)] transition group-hover:bg-[color:var(--accent)] group-hover:text-white md:h-10 md:w-10">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export function BlogCard({ item, locale }: { item: BlogItem; locale: Locale }) {
  const text = getMessages(locale);
  const readHref = item.slug ? `/blog/${item.slug}` : item.permalink;
  const isExternal = Boolean(readHref && /^https?:\/\//.test(readHref));
  const content = (
    <div className="group overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] transition group-hover:-translate-y-1 group-hover:shadow-[0_18px_40px_rgba(25,12,52,0.10)]">
      {item.imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden bg-[color:var(--soft)]">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-[1.03]"
          />
        </div>
      ) : (
        <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)] text-white">
          <span className="absolute -right-4 -top-2 select-none font-display text-[140px] font-black leading-none opacity-20" aria-hidden="true">
            G
          </span>
          <span className="relative font-display text-2xl font-extrabold tracking-tight">GEMS United</span>
        </div>
      )}
      <div className="p-5">
        {item.category ? (
          <span className="inline-flex rounded-full bg-[color:var(--brand-soft)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)]">
            {item.category}
          </span>
        ) : null}
        <h3 className="mt-3 line-clamp-2 text-lg font-bold text-[color:var(--ink)]">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--muted)]">
          {item.excerpt}
        </p>
        <span
          className={`mt-4 inline-flex items-center gap-1 text-sm font-semibold ${
            readHref
              ? "text-[color:var(--brand)] transition group-hover:text-[color:var(--brand-strong)]"
              : "cursor-not-allowed text-[color:var(--muted)]"
          }`}
          aria-hidden="true"
        >
          {text.cards.readArticle}
          {readHref ? <ArrowIcon /> : null}
        </span>
      </div>
    </div>
  );

  if (!readHref) return content;

  if (isExternal) {
    return (
      <a
        href={readHref}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)]"
        aria-label={item.title}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={readHref}
      prefetch={false}
      className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)]"
      aria-label={item.title}
    >
      {content}
    </Link>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
