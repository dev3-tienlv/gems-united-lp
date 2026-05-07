import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface OriginStoryProps {
  locale: Locale;
}

export function OriginStory({ locale }: OriginStoryProps) {
  const text = getMessages(locale).about.origin;
  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 md:grid-cols-[1.15fr_1fr] md:items-center md:px-8">
        <Reveal>
          <SectionTitle eyebrow={text.eyebrow} title={text.title} align="left" />
          <div className="mt-5 space-y-4 text-[15px] leading-7 text-[color:var(--muted)] md:text-base">
            {text.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="relative p-4 md:p-6">
            <div className="animate-float-gentle">
              <Image
                src="/logo-3d.png"
                alt={text.imageAlt}
                width={300}
                height={300}
                sizes="300px"
                className="mx-auto h-60 w-60 object-contain drop-shadow-[0_24px_30px_rgba(27,19,50,0.22)]"
              />
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-[13px] font-semibold text-[color:var(--muted)]">
              <span>{text.route.from}</span>
              <Arrow />
              <span>{text.route.to1}</span>
              <Arrow />
              <span>{text.route.to2}</span>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
