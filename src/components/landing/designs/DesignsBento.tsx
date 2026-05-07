import { Reveal } from "@/components/motion/Reveal";
import type { Locale } from "@/i18n/types";
import type { DesignItem } from "@/types/landing";
import { DesignCard } from "./DesignCard";

interface DesignsBentoProps {
  items: DesignItem[];
  locale: Locale;
}

export function DesignsBento({ items, locale }: DesignsBentoProps) {
  return (
    <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
      {items.map((item, idx) => (
        <Reveal key={item.id} delay={Math.min(idx, 7) * 0.05} className="w-full max-w-[320px]">
          <div className="mx-auto aspect-square h-auto max-h-[320px] w-full max-w-[320px]">
            <DesignCard item={item} variant="square" locale={locale} priority={idx < 2} />
          </div>
        </Reveal>
      ))}
    </div>
  );
}
