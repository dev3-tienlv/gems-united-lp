import Link from "next/link";
import { Interactive3DVisual } from "@/components/effects/Interactive3DVisual";
import { Magnetic } from "@/components/effects/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface AboutHeroProps {
  locale: Locale;
}

export function AboutHero({ locale }: AboutHeroProps) {
  const text = getMessages(locale).about.hero;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--about-hero-from)] via-[color:var(--hero-via)] to-[color:var(--about-hero-to)]">
      <div className="pointer-events-none absolute -left-20 top-6 h-64 w-64 rounded-full bg-[color:var(--brand)]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-12 bottom-0 h-72 w-72 rounded-full bg-[color:var(--accent)]/10 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-16 md:grid-cols-[1.12fr_1fr] md:px-8 md:pb-20 md:pt-20">
        <Reveal>
          <p className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--brand)] shadow-[0_8px_24px_rgba(111,66,201,0.12)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]" />
            {text.eyebrow}
          </p>
          <h1 className="mt-5 max-w-[16ch] text-balance font-display text-[clamp(34px,5.6vw,58px)] font-extrabold leading-[1.04] tracking-tight text-[color:var(--ink)]">
            {text.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--muted)] md:text-lg">
            {text.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <Link
                href="/#contact"
                className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--accent)] px-7 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(126,217,87,0.34)] transition hover:bg-[color:var(--accent-strong)]"
              >
                {text.ctaPrimary}
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/careers"
                className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-7 py-3 text-sm font-semibold text-[color:var(--ink)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)]"
              >
                {text.ctaSecondary}
              </Link>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative flex items-center justify-center md:justify-end">
          <Interactive3DVisual
            src="/mission-3d.png"
            alt={text.imageAlt}
            width={560}
            height={560}
            sizes="(max-width: 768px) 360px, 560px"
            containerClassName="h-[360px] w-[360px] md:h-[560px] md:w-[560px]"
            imageClassName="drop-shadow-[0_28px_40px_rgba(27,19,50,0.22)]"
            priority
          />
        </Reveal>
      </div>
    </section>
  );
}
