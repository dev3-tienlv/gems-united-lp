import Link from "next/link";
import { Magnetic } from "@/components/effects/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { HeroInteractiveVisual } from "@/components/landing/HeroInteractiveVisual";

interface HeroProps {
  locale: Locale;
}

export function Hero({ locale }: HeroProps) {
  const text = getMessages(locale);
  return (
    <section
      id="home"
      className="relative overflow-visible bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]"
    >
      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-24 pt-16 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-28 md:pt-24">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)] shadow-[0_4px_18px_rgba(111,66,201,0.12)] [background-color:var(--hero-badge-bg)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            {text.hero.badge}
          </p>
          <h1 className="mt-6 font-display text-[clamp(36px,8vw,60px)] font-extrabold leading-[1.05] tracking-tight text-[color:var(--ink)]">
            {text.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
            {text.hero.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Magnetic>
              <Link
                href="/#contact"
                className="group inline-flex items-center gap-2 rounded-full bg-[color:var(--accent)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(126,217,87,0.35)] transition hover:bg-[color:var(--accent-strong)]"
              >
                {text.hero.ctaPrimary}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  className="transition group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/#designs"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-7 py-3.5 text-sm font-semibold text-[color:var(--ink-2)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)]"
              >
                {text.hero.ctaSecondary}
              </Link>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative flex items-center justify-center overflow-visible">
          <HeroInteractiveVisual />
        </Reveal>
      </div>

    </section>
  );
}
