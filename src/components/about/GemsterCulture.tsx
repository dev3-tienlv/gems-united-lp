import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface GemsterCultureProps {
  locale: Locale;
}

export function GemsterCulture({ locale }: GemsterCultureProps) {
  const text = getMessages(locale).about.culture;
  return (
    <section className="bg-[color:var(--soft)] py-20 md:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionTitle
            eyebrow={text.eyebrow}
            title={text.title}
            description={text.body}
          />
        </Reveal>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          <Reveal className="md:row-span-2">
            <article className="relative h-full min-h-44 overflow-hidden rounded-3xl border border-[color:var(--line)]">
              <Image
                src="/gemster-team-moments.png"
                alt={text.gallery.main}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </article>
          </Reveal>
          <Reveal delay={0.04}>
            <article className="relative h-full min-h-44 overflow-hidden rounded-3xl border border-[color:var(--line)]">
              <Image
                src="/gemster-office-life.png"
                alt={text.gallery.side1}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {text.gallery.officeBadge}
              </span>
            </article>
          </Reveal>
          <Reveal delay={0.08}>
            <article className="relative h-full min-h-44 overflow-hidden rounded-3xl border border-[color:var(--line)]">
              <Image
                src="/gemster-team-events.png"
                alt={text.gallery.side2}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                {text.gallery.tripBadge}
              </span>
            </article>
          </Reveal>
          <Reveal delay={0.12} className="md:col-span-2">
            <article className="flex h-full min-h-36 flex-col justify-center rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 shadow-[var(--about-card-shadow)]">
              <blockquote className="text-base italic leading-7 text-[color:var(--ink-2)]">{text.quote}</blockquote>
              <p className="mt-3 text-sm font-semibold text-[color:var(--brand)]">{text.quoteAuthor}</p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
