import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface PodPipelineProps {
  locale: Locale;
}

export function PodPipeline({ locale }: PodPipelineProps) {
  const text = getMessages(locale).about.pipeline;
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionTitle
            eyebrow={text.eyebrow}
            title={text.title}
            description={text.description}
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {text.steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.05}>
              <article className="relative h-full rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--about-card-shadow)]">
                <p className="inline-flex rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[11px] font-bold tracking-[0.14em] text-[color:var(--brand)]">
                  {step.number}
                </p>
                <h3 className="mt-4 font-display text-xl font-extrabold text-[color:var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{step.desc}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
