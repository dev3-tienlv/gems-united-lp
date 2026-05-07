import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { jobPostingJsonLd } from "@/lib/seo";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { getCareerById } from "@/lib/wix-headless";

interface CareerDetailPageProps {
  params: Promise<{ id: string }>;
}

// Wix may return a sentence in `type` field; treat anything longer than this as
// noise and fall back to the localized "Full-time" label.
const TYPE_FIELD_MAX_LENGTH = 60;

function splitReadableLines(input?: string): string[] {
  if (!input) return [];
  return input
    .replace(/\r/g, "")
    .replace(/•/g, "\n•")
    .replace(/\s-\s/g, "\n- ")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanLine(line: string): string {
  return line.replace(/^([\-•●]\s*)+/, "").trim();
}

function safeTypeFor(career: { type: string }, locale: Locale): string {
  if (career.type.length > TYPE_FIELD_MAX_LENGTH) {
    return locale === "vi" ? "Toàn thời gian" : "Full-time";
  }
  return career.type;
}

export async function generateMetadata({ params }: CareerDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const career = await getCareerById(id);
  if (!career) return { title: "Not found" };

  const path = `/careers/${career.id}`;
  const description =
    career.summary?.slice(0, 200) ||
    career.responsibilities?.slice(0, 200) ||
    `${career.title} — ${career.location}`;
  return {
    title: `${career.title} — ${career.location}`,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      title: career.title,
      description,
      url: path,
      images: career.imageUrl ? [{ url: career.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: career.title,
      description,
      images: career.imageUrl ? [career.imageUrl] : undefined,
    },
  };
}

export default async function CareerDetailPage({ params }: CareerDetailPageProps) {
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  const career = await getCareerById(id);
  if (!career) notFound();
  const text = getMessages(locale);

  const applyHref =
    career.applyUrl &&
    (career.applyUrl.startsWith("http://") || career.applyUrl.startsWith("https://"))
      ? career.applyUrl
      : CONTACT_MAILTO;
  const summaryLines = splitReadableLines(career.summary);
  const safeType = safeTypeFor(career, locale);
  const sections = [
    { title: text.common.responsibilities, lines: splitReadableLines(career.responsibilities) },
    { title: text.common.requirements, lines: splitReadableLines(career.requirements) },
    { title: text.common.growthPath, lines: splitReadableLines(career.growthPath) },
    { title: text.common.benefits, lines: splitReadableLines(career.benefits) },
  ].filter((section) => section.lines.length > 0);

  return (
    <div className="bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]">
      <Header locale={locale} />
      <main id="main-content">
        <JsonLd data={jobPostingJsonLd(career, locale)} />
        <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-[color:var(--brand)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-40 h-[360px] w-[360px] rounded-full bg-[color:var(--brand-light)]/15 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-16 md:grid-cols-[1fr_1fr] md:px-8 md:pb-24 md:pt-24">
            <Reveal>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Link
                  href="/#careers"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-[color:var(--ink-2)] shadow-[0_4px_18px_rgba(10,8,24,0.06)] transition hover:text-[color:var(--brand)] [background-color:var(--hero-badge-bg)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M12 7H2M6 3L2 7l4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {text.common.backToCareers}
                </Link>

                <p className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)]/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--accent-strong)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
                  {text.cards.hiring}
                </p>
              </div>

              <h1 className="mt-5 font-display text-[40px] font-extrabold leading-[1.05] tracking-tight text-[color:var(--ink)] md:text-[56px]">
                {career.title}
              </h1>
              <p className="mt-5 text-base text-[color:var(--muted)] md:text-lg">
                {career.location} · {safeType}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={applyHref}
                  target={applyHref.startsWith("http") ? "_blank" : undefined}
                  rel={applyHref.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(126,217,87,0.35)] transition hover:bg-[color:var(--accent-strong)]"
                >
                  {text.common.applyNow}
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M2 7h10M8 3l4 4-4 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
                <a
                  href={CONTACT_MAILTO}
                  className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-7 py-3.5 text-sm font-semibold text-[color:var(--ink-2)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)]"
                >
                  Email {CONTACT_EMAIL}
                </a>
              </div>
            </Reveal>

            <Reveal delay={0.08} className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-[color:var(--soft)] shadow-[0_30px_80px_rgba(10,8,24,0.18)]">
                {career.imageUrl ? (
                  <Image
                    src={career.imageUrl}
                    alt={career.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)] text-white">
                    <span className="font-display text-4xl font-extrabold">
                      {career.title.split(" ")[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-2xl bg-[color:var(--accent)]/20 blur-2xl" />
            </Reveal>
          </div>
        </section>

        <section className="bg-[color:var(--surface)] py-20 md:py-24">
          <div className="mx-auto grid w-full max-w-7xl items-start gap-14 px-5 md:grid-cols-[1.5fr_1fr] md:px-8">
            <Reveal>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
                {text.common.roleOverview}
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
                {text.common.roleWhat}
              </h2>

              {sections.length > 0 ? (
                <div className="mt-6 space-y-7">
                  {sections.map((section, sectionIndex) => (
                    <section key={section.title}>
                      <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                        {sectionIndex + 1}. {section.title}
                      </h3>
                      <ul className="mt-3 space-y-2 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                        {section.lines.map((line, lineIndex) => (
                          <li
                            key={`${section.title}-${lineIndex}`}
                            className="flex gap-3"
                          >
                            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                            <span>{cleanLine(line)}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ))}
                </div>
              ) : summaryLines.length > 0 ? (
                <ul className="mt-6 space-y-2 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                  {summaryLines.map((line, lineIndex) => (
                    <li key={`summary-${lineIndex}`} className="flex gap-3">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                      <span>{cleanLine(line)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                  {text.common.roleFallback}
                </p>
              )}

              {(career.location || career.workSchedule) && (
                <div className="mt-8 space-y-5">
                  <section>
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                      {sections.length + 1}. {text.common.workLocation}
                    </h3>
                    <p className="mt-2 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                      {career.location}
                    </p>
                  </section>
                  {career.workSchedule ? (
                    <section>
                      <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                        {sections.length + 2}. {text.common.workTime}
                      </h3>
                      <ul className="mt-2 space-y-2 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                        {splitReadableLines(career.workSchedule).map((line, lineIndex) => (
                          <li key={`work-${lineIndex}`} className="flex gap-3">
                            <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand)]" />
                            <span>{cleanLine(line)}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              )}
            </Reveal>

            <div className="md:sticky md:top-[50vh] md:z-10 md:-translate-y-1/2 md:self-start">
              <Reveal delay={0.06}>
                <aside className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--soft)] p-7 shadow-[0_12px_40px_rgba(25,12,52,0.06)]">
                <h3 className="font-display text-lg font-bold text-[color:var(--ink)]">
                  {text.common.quickFacts}
                </h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--muted)]">{text.common.location}</dt>
                    <dd className="text-right font-semibold text-[color:var(--ink)]">
                      {career.location}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--muted)]">{text.common.type}</dt>
                    <dd className="text-right font-semibold text-[color:var(--ink)]">
                      {safeType}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--muted)]">{text.common.team}</dt>
                    <dd className="text-right font-semibold text-[color:var(--ink)]">
                      GEMS United
                    </dd>
                  </div>
                </dl>
                <a
                  href={applyHref}
                  target={applyHref.startsWith("http") ? "_blank" : undefined}
                  rel={applyHref.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--brand-strong)]"
                >
                  {text.common.applyRole}
                </a>
              </aside>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
