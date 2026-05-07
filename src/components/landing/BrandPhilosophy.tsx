import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface BrandPhilosophyProps {
  locale: Locale;
}

export function BrandPhilosophy({ locale }: BrandPhilosophyProps) {
  const text = getMessages(locale).home.brandPhilosophy;

  return (
    <section id="philosophy" className="relative overflow-hidden py-14 md:py-20">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[color:var(--philosophy-from)] via-[color:var(--philosophy-via)] to-[color:var(--philosophy-to)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-10%,rgba(140,82,255,0.14),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55] [background-image:linear-gradient(rgba(111,66,201,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(111,66,201,0.06)_1px,transparent_1px)] [background-size:26px_26px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <header className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[color:var(--brand-strong)]">
              {text.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-[32px] font-extrabold tracking-tight text-[color:var(--ink)] md:text-4xl">
              {text.title}
            </h2>
            <p className="mt-2 font-mono text-xs text-[color:var(--muted)] md:text-sm">{text.phonetic}</p>
          </header>
        </Reveal>

        <div className="mx-auto mt-9 grid gap-4 md:grid-cols-2 md:gap-5">
          <Reveal delay={0.05}>
            <article className="flex h-full flex-col rounded-2xl border border-[color:var(--brand)]/20 bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] p-5 shadow-[0_16px_36px_rgba(111,66,201,0.08)] backdrop-blur-sm md:p-6">
              <h3 className="font-display text-lg font-extrabold tracking-wide text-[color:var(--brand-strong)] md:text-xl">
                {text.gemsTitle}
              </h3>
              <p className="mt-1.5 text-xs italic leading-snug text-[color:var(--muted)] md:text-sm">
                {text.gemsSubtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--fg)]">{text.gemsBody}</p>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="flex h-full flex-col rounded-2xl border border-[color:var(--brand)]/20 bg-[color-mix(in_oklab,var(--surface)_88%,transparent)] p-5 shadow-[0_16px_36px_rgba(111,66,201,0.08)] backdrop-blur-sm md:p-6">
              <h3 className="font-display text-lg font-extrabold tracking-wide text-[color:var(--brand-strong)] md:text-xl">
                {text.unitedTitle}
              </h3>
              <p className="mt-1.5 text-xs italic leading-snug text-[color:var(--muted)] md:text-sm">
                {text.unitedSubtitle}
              </p>
              <p className="mt-3 flex-1 text-sm leading-6 text-[color:var(--fg)]">{text.unitedBody}</p>
            </article>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <div className="mt-5 w-full rounded-2xl border border-[color:var(--brand)]/18 bg-[color-mix(in_oklab,var(--surface)_92%,transparent)] px-5 py-7 shadow-[0_18px_40px_rgba(111,66,201,0.09)] backdrop-blur-sm md:px-8 md:py-8">
            <p
              className="mx-auto block text-center font-display text-5xl font-black leading-none text-[color:var(--brand-light)] md:text-6xl"
              aria-hidden="true"
            >
              “
            </p>
            <blockquote className="mx-auto mt-3 max-w-none text-center font-display text-base font-semibold leading-snug text-[color:var(--ink)] md:text-lg md:leading-relaxed md:max-w-4xl">
              {text.quote}
            </blockquote>
            <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-4">
              <span
                className="h-px w-full max-w-[120px] flex-1 bg-gradient-to-r from-transparent via-[color:var(--brand-light)] to-[color:var(--brand-light)]/70"
                aria-hidden="true"
              />
              <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                {text.commitment}
              </span>
              <span
                className="h-px w-full max-w-[120px] flex-1 bg-gradient-to-l from-transparent via-[color:var(--brand-light)] to-[color:var(--brand-light)]/70"
                aria-hidden="true"
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
