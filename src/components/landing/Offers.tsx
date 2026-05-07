import { MissionVisual } from "@/components/landing/MissionVisual";
import { Reveal } from "@/components/motion/Reveal";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface OffersProps {
  locale: Locale;
}

export function Offers({ locale }: OffersProps) {
  const text = getMessages(locale);
  return (
    <section id="offers" className="relative bg-[color:var(--soft)] py-20 md:py-28">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <MissionVisual locale={locale} />
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
            {text.offers.eyebrow}
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
            {text.offers.title}
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--muted)]">
            {text.offers.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
