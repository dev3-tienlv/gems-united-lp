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
                src="/journey-3d-v2.png"
                alt={text.imageAlt}
                width={420}
                height={420}
                sizes="(max-width: 768px) 320px, 420px"
                className="mx-auto h-72 w-72 object-contain drop-shadow-[0_24px_30px_rgba(27,19,50,0.22)] md:h-[420px] md:w-[420px]"
              />
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

