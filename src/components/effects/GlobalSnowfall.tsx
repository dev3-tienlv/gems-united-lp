import type { CSSProperties } from "react";

const DESKTOP_FLAKES = 48;

type SnowflakeStyle = CSSProperties & Record<`--snow-${string}`, string>;

function seededRandom(seed: number) {
  let value = seed + 0x6d2b79f5;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
}

function randomBetween(seed: number, min: number, max: number) {
  return seededRandom(seed) * (max - min) + min;
}

function createSnowflakeStyle(index: number): SnowflakeStyle {
  const seed = (index + 1) * 997;
  return {
    left: `${randomBetween(seed, 0, 100).toFixed(2)}vw`,
    "--snow-size": `${randomBetween(seed + 1, 1, 4).toFixed(1)}px`,
    "--snow-opacity": randomBetween(seed + 2, 0.45, 0.95).toFixed(2),
    "--snow-blur": `${randomBetween(seed + 3, 0, 0.7).toFixed(1)}px`,
    "--snow-fall-duration": `${randomBetween(seed + 4, 11, 22).toFixed(2)}s`,
    "--snow-delay": `${randomBetween(seed + 6, -22, 0).toFixed(2)}s`,
    "--snow-drift": `${randomBetween(seed + 8, -45, 45).toFixed(0)}px`,
    "--snow-rotation": `${randomBetween(seed + 9, -120, 120).toFixed(0)}deg`,
  };
}

const snowflakes = Array.from({ length: DESKTOP_FLAKES }, (_, index) =>
  createSnowflakeStyle(index),
);

export function GlobalSnowfall() {
  return (
    <>
      <style>{`
        .global-snowfall {
          position: fixed;
          inset: 0;
          z-index: 40;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .global-snowflake {
          position: absolute;
          top: -10px;
          left: 0;
          width: var(--snow-size);
          height: var(--snow-size);
          border-radius: 50%;
          background: rgba(255, 255, 255, var(--snow-opacity));
          filter: blur(var(--snow-blur));
          animation: global-snow-fall var(--snow-fall-duration) linear infinite;
          animation-delay: var(--snow-delay);
          will-change: transform;
        }

        @keyframes global-snow-fall {
          from { transform: translate3d(0, -5vh, 0) rotate(0); }
          to { transform: translate3d(var(--snow-drift), 110vh, 0) rotate(var(--snow-rotation)); }
        }

        @media (max-width: 749px) {
          .global-snowflake {
            filter: none;
          }

          .global-snowflake:nth-child(n + 17) { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          .global-snowfall { display: none; }
        }
      `}</style>
      <div className="global-snowfall" aria-hidden="true">
        {snowflakes.map((style, index) => (
          <span key={index} className="global-snowflake" style={style} />
        ))}
      </div>
    </>
  );
}
