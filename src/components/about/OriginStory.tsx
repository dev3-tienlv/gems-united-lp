import { Interactive3DVisual } from "@/components/effects/Interactive3DVisual";
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
          <article className="relative flex justify-center p-4 md:p-6">
            <Interactive3DVisual
              src="/journey-3d-v2.png"
              alt={text.imageAlt}
              width={520}
              height={520}
              sizes="(max-width: 768px) 360px, 520px"
              containerClassName="h-[340px] w-[340px] md:h-[520px] md:w-[520px]"
              imageClassName="drop-shadow-[0_28px_36px_rgba(27,19,50,0.22)]"
            />
          </article>
        </Reveal>
      </div>
    </section>
  );
}

