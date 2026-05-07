import Link from "next/link";
import { Magnetic } from "@/components/effects/Magnetic";
import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface DualCtaProps {
  locale: Locale;
}

export function DualCta({ locale }: DualCtaProps) {
  const text = getMessages(locale).about.cta;
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--surface)] via-[color:var(--soft)] to-[color:var(--surface)] pb-40 pt-20 text-[color:var(--ink)] md:pb-40 md:pt-24">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <header className="max-w-3xl">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
              {text.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              {text.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-[color:var(--muted)] md:text-[17px]">
              {text.description}
            </p>
          </header>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-7 backdrop-blur">
              <h3 className="font-display text-2xl font-extrabold">{text.partnerTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text.partnerDesc}</p>
              <Magnetic className="mt-6 inline-flex">
                <Link
                  href="/#contact"
                  className="inline-flex min-h-11 items-center rounded-full bg-[color:var(--accent)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[color:var(--accent-strong)]"
                >
                  {text.partnerCta}
                </Link>
              </Magnetic>
            </article>
          </Reveal>

          <Reveal delay={0.06}>
            <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)]/80 p-7 backdrop-blur">
              <h3 className="font-display text-2xl font-extrabold">{text.careerTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">{text.careerDesc}</p>
              <Magnetic className="mt-6 inline-flex">
                <Link
                  href="/careers"
                  className="inline-flex min-h-11 items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] px-6 py-2.5 text-sm font-semibold text-[color:var(--ink)] shadow-[0_8px_20px_rgba(18,10,40,0.08)] transition hover:bg-[color:var(--soft)]"
                >
                  {text.careerCta}
                </Link>
              </Magnetic>
            </article>
          </Reveal>
        </div>
      </div>
      <svg
        className="pointer-events-none absolute -bottom-px left-0 h-16 w-full text-[color:var(--surface)] md:h-20"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 42C120 34 240 34 360 40C480 46 600 56 720 54C840 52 960 40 1080 34C1200 28 1320 30 1440 38V120H0V42Z"
        />
      </svg>
    </section>
  );
}
