import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { CareerCard } from "@/components/landing/cards";
import { Header } from "@/components/landing/Header";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/constants";
import { jobPostingJsonLd } from "@/lib/seo";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { resolveCareerFields } from "@/lib/career-locale";
import { formatEmploymentType } from "@/lib/employment-type";
import { getAllCareers, getCareerBySlug } from "@/lib/wix-headless";
import type { CareerItem } from "@/types/landing";
export const revalidate = 60;

interface CareerDetailPageProps {
  params: Promise<{ slug: string }>;
}

function splitReadableLines(input?: string): string[] {
  if (!input) return [];
  return input
    .replace(/\r/g, "")
    .replace(/•/g, "\n•")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function cleanLine(line: string): string {
  return line.replace(/^([\-•●]\s*)+/, "").trim();
}

interface HierarchicalLineItem {
  text: string;
  children: string[];
}

interface BuildHierarchicalLinesOptions {
  /**
   * EN work schedule often uses "Working days: …" with sub-lines "Morning shift: …"
   * (colon mid-line). VI uses trailing colon parents ("Thứ 7:"). Enable for work schedule only.
   */
  groupMidColonLabelRuns?: boolean;
}

function isLabelValueLine(text: string): boolean {
  return /^[^:：]+[:：]\s*.+/.test(text);
}

function hasFollowingLabelValueLines(lines: string[], index: number): boolean {
  for (let i = index + 1; i < lines.length; i++) {
    const next = cleanLine(lines[i]);
    if (!next) continue;
    if (/[:：]$/.test(next)) return false;
    return isLabelValueLine(next);
  }
  return false;
}

function buildHierarchicalLines(
  lines: string[],
  options: BuildHierarchicalLinesOptions = {},
): HierarchicalLineItem[] {
  const { groupMidColonLabelRuns = false } = options;
  const items: HierarchicalLineItem[] = [];
  let currentParentIndex: number | null = null;

  const appendToPrevious = (suffix: string): boolean => {
    if (currentParentIndex !== null) {
      const parentItem = items[currentParentIndex];
      if (!parentItem) return false;

      if (parentItem.children.length > 0) {
        const lastChildIndex = parentItem.children.length - 1;
        parentItem.children[lastChildIndex] = `${parentItem.children[lastChildIndex]} ${suffix}`.trim();
        return true;
      }

      parentItem.text = `${parentItem.text} ${suffix}`.trim();
      return true;
    }

    const lastItem = items[items.length - 1];
    if (!lastItem) return false;
    lastItem.text = `${lastItem.text} ${suffix}`.trim();
    return true;
  };

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const text = cleanLine(lines[lineIndex]);
    if (!text) continue;

    if (/^[([{]/.test(text) && appendToPrevious(text)) {
      continue;
    }

    const isTrailingColonParent = /[:：]$/.test(text);
    if (isTrailingColonParent) {
      items.push({ text, children: [] });
      currentParentIndex = items.length - 1;
      continue;
    }

    // Nested lines under "Thứ 2 – Thứ 7:" (VI) or mid-colon header children (EN)
    if (currentParentIndex !== null) {
      items[currentParentIndex]?.children.push(text);
      continue;
    }

    const isMidColonParent =
      groupMidColonLabelRuns && isLabelValueLine(text) && hasFollowingLabelValueLines(lines, lineIndex);

    if (isMidColonParent) {
      items.push({ text, children: [] });
      currentParentIndex = items.length - 1;
      continue;
    }

    items.push({ text, children: [] });
  }

  return items;
}

function normalizeMatchValue(value?: string): string {
  return value?.trim().toLowerCase() ?? "";
}

function pickRelatedCareers(careers: CareerItem[], currentCareer: CareerItem, limit = 3): CareerItem[] {
  const currentType = normalizeMatchValue(currentCareer.type);
  const currentLocation = normalizeMatchValue(currentCareer.location);

  return careers
    .filter((item) => item.id !== currentCareer.id)
    .map((item, index) => {
      const typeMatch = normalizeMatchValue(item.type) === currentType ? 2 : 0;
      const locationMatch = normalizeMatchValue(item.location) === currentLocation ? 1 : 0;
      return { item, score: typeMatch + locationMatch, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export async function generateMetadata({ params }: CareerDetailPageProps): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const allCareers = await getAllCareers();
  const career = await getCareerBySlug(slug, allCareers);
  if (!career) return { title: "Not found" };

  const fields = resolveCareerFields(career, locale);
  const path = `/careers/${career.slug}`;
  const description =
    fields.summary?.slice(0, 200) ||
    fields.responsibilities?.slice(0, 200) ||
    `${career.title} — ${fields.location}`;
  return {
    title: `${career.title} — ${fields.location}`,
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
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const allCareers = await getAllCareers();
  const career = await getCareerBySlug(slug, allCareers);
  if (!career) notFound();
  const text = getMessages(locale);
  const fields = resolveCareerFields(career, locale);
  const relatedCareers = pickRelatedCareers(allCareers, career);

  const applyHref =
    career.applyUrl &&
    (career.applyUrl.startsWith("http://") || career.applyUrl.startsWith("https://"))
      ? career.applyUrl
      : CONTACT_MAILTO;
  const summaryLines = splitReadableLines(fields.summary);
  const summaryItems = buildHierarchicalLines(summaryLines);
  const employmentLabel = formatEmploymentType(career.type, locale);
  const sections = [
    { title: text.common.responsibilities, lines: splitReadableLines(fields.responsibilities) },
    { title: text.common.requirements, lines: splitReadableLines(fields.requirements) },
    { title: text.common.growthPath, lines: splitReadableLines(fields.growthPath) },
    { title: text.common.benefits, lines: splitReadableLines(fields.benefits) },
  ]
    .map((section) => ({
      title: section.title,
      items: buildHierarchicalLines(section.lines),
    }))
    .filter((section) => section.items.length > 0);
  const workScheduleItems = buildHierarchicalLines(splitReadableLines(fields.workSchedule), {
    groupMidColonLabelRuns: true,
  });

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
                {fields.location} · {employmentLabel}
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
              <div
                className={
                  career.imageUrl
                    ? "relative aspect-square w-full overflow-hidden rounded-[32px] shadow-[0_30px_80px_rgba(10,8,24,0.18)]"
                    : "relative aspect-square w-full overflow-hidden rounded-[32px] bg-[color:var(--soft)] shadow-[0_30px_80px_rgba(10,8,24,0.18)]"
                }
              >
                {career.imageUrl ? (
                  <Image
                    src={career.imageUrl}
                    alt={career.title}
                    width={1026}
                    height={1026}
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="h-full w-full object-cover object-center"
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

        <section className="bg-[color:var(--surface)] pb-20 pt-20 md:pb-24 md:pt-24">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
                {text.common.roleOverview}
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
                {text.common.roleWhat}
              </h2>

              {sections.length > 0 ? (
                <div className="mt-8 space-y-6">
                  {sections.map((section, sectionIndex) => {
                    const sectionNumber = sectionIndex + 1;
                    return (
                      <section
                        key={section.title}
                      className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_10px_30px_rgba(25,12,52,0.04)] md:p-6"
                      >
                        <h3 className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                          <span
                            className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[color:var(--brand-soft)] px-2 text-[11px] tracking-normal text-[color:var(--brand)]"
                          >
                            {sectionNumber}
                          </span>
                          <span>{section.title}</span>
                        </h3>
                        <ul className="mt-4 space-y-3.5 pl-3 text-base leading-7 text-[color:var(--muted)] md:pl-4 md:text-[17px]">
                          {section.items.map((item, lineIndex) => (
                            <li
                              key={`${section.title}-${lineIndex}`}
                              className="flex gap-3.5"
                            >
                              <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)] shadow-[0_0_0_4px_rgba(111,66,201,0.12)]" />
                              <div className="min-w-0">
                                <p className="text-[color:var(--ink-2)]">{item.text}</p>
                                {item.children.length > 0 ? (
                                  <ul className="mt-2 space-y-1.5 pl-3 text-[15px] leading-6 text-[color:var(--muted)] md:text-base">
                                    {item.children.map((child, childIndex) => (
                                      <li key={`${section.title}-${lineIndex}-child-${childIndex}`} className="flex gap-1.5">
                                        <span className="shrink-0 text-[color:var(--brand)]">-</span>
                                        <span>{child}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </section>
                    );
                  })}
                </div>
              ) : summaryItems.length > 0 ? (
                <ul className="mt-8 space-y-3.5 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 text-base leading-7 text-[color:var(--muted)] shadow-[0_10px_30px_rgba(25,12,52,0.04)] md:p-6 md:text-[17px]">
                  {summaryItems.map((item, lineIndex) => (
                    <li key={`summary-${lineIndex}`} className="flex gap-3.5 pl-3 md:pl-4">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)] shadow-[0_0_0_4px_rgba(111,66,201,0.12)]" />
                      <div className="min-w-0">
                        <p className="text-[color:var(--ink-2)]">{item.text}</p>
                        {item.children.length > 0 ? (
                          <ul className="mt-2 space-y-1.5 pl-3 text-[15px] leading-6 text-[color:var(--muted)] md:text-base">
                            {item.children.map((child, childIndex) => (
                              <li key={`summary-${lineIndex}-child-${childIndex}`} className="flex gap-1.5">
                                <span className="shrink-0 text-[color:var(--brand)]">-</span>
                                <span>{child}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
                  {text.common.roleFallback}
                </p>
              )}

              {(fields.location || fields.workSchedule) && (
                <div className="mt-6 space-y-6">
                  <section className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_10px_30px_rgba(25,12,52,0.04)] md:p-6">
                    <h3 className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                      <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[color:var(--brand-soft)] px-2 text-[11px] tracking-normal text-[color:var(--brand)]">
                        {sections.length + 1}
                      </span>
                      <span>{text.common.workLocation}</span>
                    </h3>
                    <div className="mt-4 flex gap-3.5 pl-3 text-base leading-7 text-[color:var(--muted)] md:pl-4 md:text-[17px]">
                      <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)] shadow-[0_0_0_4px_rgba(111,66,201,0.12)]" />
                      <p className="text-[color:var(--ink-2)]">{fields.location}</p>
                    </div>
                  </section>
                  {fields.workSchedule ? (
                    <section className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-5 shadow-[0_10px_30px_rgba(25,12,52,0.04)] md:p-6">
                      <h3 className="flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.14em] text-[color:var(--ink)]">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[color:var(--brand-soft)] px-2 text-[11px] tracking-normal text-[color:var(--brand)]">
                          {sections.length + 2}
                        </span>
                        <span>{text.common.workTime}</span>
                      </h3>
                      <ul className="mt-4 space-y-3.5 pl-3 text-base leading-7 text-[color:var(--muted)] md:pl-4 md:text-[17px]">
                        {workScheduleItems.map((item, lineIndex) => (
                          <li key={`work-${lineIndex}`} className="flex gap-3.5">
                            <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)] shadow-[0_0_0_4px_rgba(111,66,201,0.12)]" />
                            <div className="min-w-0">
                              <p className="text-[color:var(--ink-2)]">{item.text}</p>
                              {item.children.length > 0 ? (
                                <ul className="mt-2 space-y-1.5 pl-3 text-[15px] leading-6 text-[color:var(--muted)] md:text-base">
                                  {item.children.map((child, childIndex) => (
                                    <li key={`work-${lineIndex}-child-${childIndex}`} className="flex gap-1.5">
                                      <span className="shrink-0 text-[color:var(--brand)]">-</span>
                                      <span>{child}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : null}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              )}
            </Reveal>

            <div className="mt-10 w-full md:mt-12 md:ml-auto md:w-1/2">
              <aside className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--soft)] p-7 shadow-[0_12px_40px_rgba(25,12,52,0.06)]">
                <h3 className="font-display text-lg font-bold text-[color:var(--ink)]">
                  {text.common.quickFacts}
                </h3>
                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--muted)]">{text.common.location}</dt>
                    <dd className="text-right font-semibold text-[color:var(--ink)]">
                      {fields.location}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[color:var(--muted)]">{text.common.type}</dt>
                    <dd className="text-right font-semibold text-[color:var(--ink)]">
                      {employmentLabel}
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
            </div>
          </div>
        </section>

        {relatedCareers.length > 0 ? (
          <section className="bg-[color:var(--surface)] pb-32 md:pb-40">
            <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
              <Reveal>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
                      {text.common.careersEyebrow}
                    </p>
                    <h2 className="mt-2 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
                      {text.common.relatedCareers}
                    </h2>
                    <p className="mt-3 max-w-2xl text-base text-[color:var(--muted)] md:text-lg">
                      {text.common.relatedCareersDesc}
                    </p>
                  </div>
                  <Link
                    href="/careers"
                    className="hidden rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink-2)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)] md:inline-flex"
                  >
                    {text.common.careersTitle}
                  </Link>
                </div>

                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedCareers.map((relatedCareer) => (
                    <CareerCard key={relatedCareer.id} item={relatedCareer} locale={locale} />
                  ))}
                </div>

                <div className="mt-6 md:hidden">
                  <Link
                    href="/careers"
                    className="inline-flex rounded-full border border-[color:var(--line)] px-5 py-2.5 text-sm font-semibold text-[color:var(--ink-2)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)]"
                  >
                    {text.common.careersTitle}
                  </Link>
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
