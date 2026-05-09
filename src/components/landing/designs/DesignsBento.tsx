import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/i18n/types";
import type { DesignItem } from "@/types/landing";
import { DesignCard } from "./DesignCard";
import { ShowMoreGrid } from "./ShowMoreGrid";
import { getMessages } from "@/i18n/messages";

interface DesignsBentoProps {
  items: DesignItem[];
  locale: Locale;
}

export function DesignsBento({ items, locale }: DesignsBentoProps) {
  const text = getMessages(locale);
  const showMoreText = text.designs.showMore || "Show more";

  const cards = items.map((item, idx) => (
    <Reveal key={item.id} delay={Math.min(idx, 7) * 0.05} className="w-full max-w-[320px]">
      <div className="mx-auto aspect-square h-auto max-h-[320px] w-full max-w-[320px]">
        <DesignCard item={item} variant="square" locale={locale} priority={idx < 2} />
      </div>
    </Reveal>
  ));

  return (
    <ShowMoreGrid showMoreText={showMoreText} initialCount={12} step={12}>
      {cards}
    </ShowMoreGrid>
  );
}
