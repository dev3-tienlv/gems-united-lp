import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { CompanyGallerySlider } from "@/components/landing/CompanyGallerySlider";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import type { CompanyImageItem } from "@/types/landing";

interface CompanyGalleryProps {
  items: CompanyImageItem[];
  locale: Locale;
}

export function CompanyGallery({ items, locale }: CompanyGalleryProps) {
  const text = getMessages(locale).home.companyGallery;
  const publishedItems = items.filter((item) => item.imageUrl || item.title);
  const hasItems = publishedItems.length > 0;

  return (
    <section id="gallery" className="relative overflow-hidden bg-[color:var(--surface)] py-14 md:py-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(140,82,255,0.08),transparent_60%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(111,66,201,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(111,66,201,0.04)_1px,transparent_1px)] [background-size:28px_28px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionTitle
            eyebrow={text.eyebrow}
            title={text.title}
            description={text.description}
            maxWidth="4xl"
          />
        </Reveal>

        <div className="mt-10 md:mt-12">
          {hasItems ? (
            <Reveal delay={0.08}>
              <CompanyGallerySlider
                items={publishedItems}
                locale={locale}
                labels={{
                  sliderAriaLabel: text.sliderAriaLabel,
                  prevSlide: text.prevSlide,
                  nextSlide: text.nextSlide,
                  badge: text.badge,
                }}
              />
            </Reveal>
          ) : (
            <Reveal delay={0.08}>
              <div className="rounded-3xl border border-dashed border-[color:var(--line)] bg-[color:var(--soft)] px-6 py-14 text-center md:px-10">
                <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand)]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M4 7a2 2 0 0 1 2-2h3l1-2h4l1 2h3a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                </span>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-6 text-[color:var(--muted)] md:text-base">
                  {text.emptyState}
                </p>
                <Link
                  href="/#contact"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
                >
                  {text.ctaPrimary}
                </Link>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
