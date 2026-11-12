import { MissionVisual } from "@/components/landing/MissionVisual";
import { Reveal } from "@/components/motion/Reveal";
import { WinterOrnament } from "@/components/xmas/WinterPageDecor";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface OffersProps {
  locale: Locale;
}

export function Offers({ locale }: OffersProps) {
  const text = getMessages(locale);
  return (
    <section id="offers" className="relative bg-[color:var(--soft)] py-10 md:py-14">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-8">
        <Reveal>
          <MissionVisual locale={locale} />
        </Reveal>

        <Reveal delay={0.08} className="relative pb-14 md:pb-20">
          <div className="relative z-10">
            <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[color:var(--brand)]">
              {text.offers.eyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight text-[color:var(--ink)] md:text-4xl">
              {text.offers.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[color:var(--muted)]">
              {text.offers.description}
            </p>
          </div>
          <WinterOrnament
            name="purple-gift-boxes"
            motion="float"
            placement="home-offers-gifts"
            sizes="(max-width: 767px) 175px, 310px"
          />
        </Reveal>
      </div>
    </section>
  );
}
