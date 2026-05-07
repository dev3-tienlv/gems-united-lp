import { Reveal } from "@/components/motion/Reveal";
import { missionTileGradients, missionVisualLetters } from "@/lib/gems-accents";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";

interface MissionVisualProps {
  locale: Locale;
}

const FALLBACK_LETTER = missionVisualLetters[0];

function getTileLetter(index: number) {
  return missionVisualLetters[index % missionVisualLetters.length] ?? FALLBACK_LETTER;
}

export function MissionVisual({ locale }: MissionVisualProps) {
  const tiles = getMessages(locale).offers.missionVisualTiles;

  return (
    <div className="relative mx-auto w-full max-w-xl md:max-w-none">
      <div
        className="pointer-events-none absolute -left-10 top-1/2 h-[min(420px,70vw)] w-[min(420px,70vw)] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(140,82,255,0.28)_0%,transparent_68%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(111,66,201,0.18)_0%,transparent_65%)] blur-xl"
        aria-hidden="true"
      />

      <div className="relative rounded-[28px] border border-[color:var(--brand)]/15 bg-[color:var(--soft)]/80 p-3 shadow-[0_24px_52px_rgba(111,66,201,0.1)] ring-1 ring-[color:var(--line)] backdrop-blur-md md:p-3.5">
        <div className="grid grid-cols-2 gap-3 md:gap-3.5">
          {tiles.map((tile, index) => {
            const letter = getTileLetter(index);
            const accent = missionTileGradients[letter];
            return (
              <Reveal key={tile.title} delay={index * 0.06}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-[color:var(--brand)]/55 bg-[color:var(--surface)] p-5 shadow-[0_14px_36px_rgba(25,12,52,0.08)] transition hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_22px_48px_rgba(25,12,52,0.12)] md:p-6">
                  <span
                    className="pointer-events-none absolute -right-3 -top-2 select-none font-display text-[clamp(72px,18vw,118px)] font-black leading-none tracking-tighter opacity-[0.07] transition group-hover:opacity-[0.14] md:text-[118px]"
                    style={{
                      background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                    aria-hidden="true"
                  >
                    {letter}
                  </span>
                  <div className="relative flex flex-1 flex-col">
                    <span
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl font-display text-xl font-extrabold text-white shadow-[0_10px_24px_rgba(111,66,201,0.22)] md:h-12 md:w-12 md:text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
                      }}
                    >
                      {letter}
                    </span>
                    <h3 className="mt-4 font-display text-base font-extrabold leading-snug tracking-tight text-[color:var(--ink)] md:text-lg">
                      {tile.title}
                    </h3>
                    <p className="mt-2 flex-1 text-[11px] font-semibold uppercase leading-relaxed tracking-[0.12em] text-[color:var(--muted)] md:text-xs md:tracking-[0.14em]">
                      {tile.hint}
                    </p>
                    <div
                      className="mt-4 h-1 w-12 shrink-0 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${accent.from}, ${accent.to})`,
                      }}
                      aria-hidden="true"
                    />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
