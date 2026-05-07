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
    <section className="bg-gradient-to-br from-[color:var(--brand)] to-[color:var(--brand-light)] py-20 text-white md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <header className="max-w-3xl">
            <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.22em] text-white/80">
              {text.eyebrow}
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-tight md:text-4xl">
              {text.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/85 md:text-[17px]">
              {text.description}
            </p>
          </header>
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Reveal>
            <article className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur">
              <h3 className="font-display text-2xl font-extrabold">{text.partnerTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">{text.partnerDesc}</p>
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
            <article className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur">
              <h3 className="font-display text-2xl font-extrabold">{text.careerTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-white/85">{text.careerDesc}</p>
              <Magnetic className="mt-6 inline-flex">
                <Link
                  href="/careers"
                  className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[color:var(--ink)] transition hover:bg-[color:var(--soft)]"
                >
                  {text.careerCta}
                </Link>
              </Magnetic>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
