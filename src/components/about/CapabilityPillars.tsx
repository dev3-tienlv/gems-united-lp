import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface CapabilityPillarsProps {
  locale: Locale;
}

export function CapabilityPillars({ locale }: CapabilityPillarsProps) {
  const text = getMessages(locale).about.capabilities;
  return (
    <section className="bg-[color:var(--soft)] py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionTitle
            eyebrow={text.eyebrow}
            title={text.title}
            description={text.description}
          />
        </Reveal>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {text.pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 0.06}>
              <article className="h-full rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-7 shadow-[var(--about-card-shadow)]">
                <h3 className="font-display text-2xl font-extrabold text-[color:var(--ink)]">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  {pillar.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {pillar.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-[color:var(--ink-2)]">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[color:var(--brand-light)]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
