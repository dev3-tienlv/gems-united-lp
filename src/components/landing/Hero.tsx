import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface HeroProps {
  locale: Locale;
}

export function Hero({ locale }: HeroProps) {
  const text = getMessages(locale);
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]"
    >
      <PurpleBlobs />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 pb-24 pt-16 md:grid-cols-[1.1fr_1fr] md:px-8 md:pb-28 md:pt-24">
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
            <Link
              href="/#designs"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-7 py-3.5 text-sm font-semibold text-[color:var(--ink-2)] transition hover:border-[color:var(--brand-light)] hover:text-[color:var(--brand)]"
            >
              {text.hero.ctaSecondary}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="relative flex items-center justify-center">
          <div className="relative">
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-[color:var(--brand)]/14" />
            <div className="pointer-events-none absolute -bottom-8 -right-8 h-24 w-24 rounded-full bg-[color:var(--accent)]/12" />
            <div className="relative animate-float-gentle">
              <Image
                src="/logo-3d.png"
                alt="GEMS United 3D logo"
                width={430}
                height={430}
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 360px, 430px"
                className="h-[360px] w-[360px] object-contain drop-shadow-[0_22px_24px_rgba(27,19,50,0.22)] md:h-[430px] md:w-[430px]"
              />
            </div>
          </div>
        </Reveal>
      </div>

      <BottomFade />
    </section>
  );
}

function PurpleBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -right-24 -top-20 h-[640px] w-[640px] text-[color:var(--brand)]"
        viewBox="0 0 600 600"
        fill="currentColor"
      >
        <path d="M421,323Q380,396,302,420Q224,444,152,396Q80,348,73,266Q66,184,143,140Q220,96,304,93Q388,90,431,165Q474,240,421,323Z" />
      </svg>
      <svg
        className="absolute -right-12 top-48 h-[420px] w-[420px] text-[color:var(--brand-light)] opacity-80"
        viewBox="0 0 600 600"
        fill="currentColor"
      >
        <path d="M463,316Q433,392,361,423Q289,454,210,434Q131,414,99,338Q67,262,124,205Q181,148,259,126Q337,104,406,153Q475,202,475,251Q475,265,463,316Z" />
      </svg>
      <div className="absolute left-[6%] top-[14%] h-3 w-3 rounded-full bg-[color:var(--hero-spark)]" />
      <div className="absolute left-[14%] top-[24%] h-1.5 w-1.5 rounded-full bg-[color:var(--hero-spark)]/80" />
      <div className="absolute left-[48%] top-[8%] h-2 w-2 rounded-full bg-[color:var(--hero-spark)]/70" />
      <div className="absolute right-[40%] bottom-[12%] h-2 w-2 rounded-full bg-[color:var(--brand-light)]/70" />
    </div>
  );
}

function BottomFade() {
  return (
    <svg
      className="absolute bottom-0 left-0 right-0 h-12 w-full text-[color:var(--hero-fade-bottom)]"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M0,40 C240,90 480,0 720,30 C960,60 1200,80 1440,40 L1440,80 L0,80 Z"
      />
    </svg>
  );
}
