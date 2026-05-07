import { Reveal } from "@/components/motion/Reveal";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { DesignsBento } from "@/components/landing/designs/DesignsBento";
import { DesignsEmptyState } from "@/components/landing/designs/DesignsEmptyState";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import type { DesignItem } from "@/types/landing";

interface OurDesignsProps {
  items: DesignItem[];
  locale: Locale;
}

export function OurDesigns({ items, locale }: OurDesignsProps) {
  const text = getMessages(locale);
  const hasItems = items.length > 0;

  return (
    <section id="designs" className="bg-[color:var(--soft)] py-20 md:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
        <Reveal>
          <SectionTitle
            eyebrow={text.designs.eyebrow}
            title={text.designs.title}
            description={text.designs.description}
          />
        </Reveal>

        <div className="mt-14">
          {hasItems ? (
            <DesignsBento items={items} locale={locale} />
          ) : (
            <DesignsEmptyState text={text.designs.emptyState} ctaLabel={text.designs.ctaPrimary} />
          )}
        </div>
      </div>
    </section>
  );
}
