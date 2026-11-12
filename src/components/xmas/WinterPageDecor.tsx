import Image from "next/image";
import type { ReactNode } from "react";

const ORNAMENTS = {
  "silver-ornament-pine": { src: "/xmas/ornaments/silver-ornament-pine.png", width: 1400, height: 896 },
  "purple-gift-boxes": { src: "/xmas/ornaments/purple-gift-boxes.png", width: 1400, height: 953 },
  "red-ribbon-gift-snow": { src: "/xmas/ornaments/red-ribbon-gift-snow.png", width: 1400, height: 610 },
  "snow-corner-red-bow": { src: "/xmas/ornaments/snow-corner-red-bow.png", width: 1602, height: 740 },
  "snowy-red-gift": { src: "/xmas/ornaments/snowy-red-gift.png", width: 1400, height: 995 },
  "fairy-lights-pine": { src: "/xmas/ornaments/fairy-lights-pine.png", width: 1400, height: 1109 },
} as const;

type WinterOrnamentName = keyof typeof ORNAMENTS;

type WinterOrnamentPlacement =
  | "home-gallery-lights"
  | "home-gallery-silver"
  | "home-gallery-snow"
  | "home-offers-gifts";

type WinterOrnamentProps = {
  name: WinterOrnamentName;
  className?: string;
  motion?: "sway" | "float" | "still";
  placement: WinterOrnamentPlacement;
  sizes?: string;
};

type WinterPageShellProps = {
  children: ReactNode;
  className?: string;
};

export function WinterOrnament({
  name,
  className = "",
  motion = "sway",
  placement,
  sizes = "(max-width: 767px) 42vw, 320px",
}: WinterOrnamentProps) {
  const ornament = ORNAMENTS[name];

  return (
    <span
      className={`winter-ornament winter-ornament--${motion} winter-ornament--${placement} ${className}`}
      aria-hidden="true"
    >
      <Image
        src={ornament.src}
        alt=""
        width={ornament.width}
        height={ornament.height}
        sizes={sizes}
        loading="lazy"
        className="select-none"
        style={{ width: "100%", height: "auto" }}
      />
    </span>
  );
}

export function WinterOrnamentStyles() {
  return (
    <style>{`
      .winter-ornament {
        position: absolute;
        z-index: 20;
        display: block;
        pointer-events: none;
        user-select: none;
        transform-origin: 50% 55%;
      }

      .winter-ornament--sway {
        animation: winter-ornament-sway 7.4s ease-in-out -1.8s infinite alternate;
      }

      .winter-ornament--float {
        animation: winter-ornament-float 6.2s ease-in-out -3.1s infinite alternate;
      }

      .winter-ornament--still { animation: none; }
      .winter-ornament--home-gallery-lights { display: none; }
      .winter-ornament--home-gallery-snow { left: -24px; top: -34px; width: 270px; }
      .winter-ornament--home-gallery-silver { display: none; }
      .winter-ornament--home-offers-gifts { bottom: -46px; right: -28px; width: 175px; }

      @keyframes winter-ornament-sway {
        from { transform: translate3d(0, -2px, 0) rotate(-1.4deg); }
        to { transform: translate3d(0, 5px, 0) rotate(1.4deg); }
      }

      @keyframes winter-ornament-float {
        from { transform: translate3d(0, -3px, 0) rotate(0.7deg); }
        to { transform: translate3d(0, 5px, 0) rotate(-0.7deg); }
      }

      @media (min-width: 768px) {
        .winter-ornament--home-gallery-lights { display: block; right: -76px; top: -92px; width: 330px; opacity: 0.92; }
        .winter-ornament--home-gallery-snow { left: -44px; top: -72px; width: 520px; }
        .winter-ornament--home-gallery-silver { display: block; bottom: -48px; right: -58px; width: 330px; }
        .winter-ornament--home-offers-gifts { bottom: -76px; right: -66px; width: 310px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .winter-ornament { animation: none !important; }
      }
    `}</style>
  );
}

export function WinterPageShell({ children, className = "" }: WinterPageShellProps) {
  return (
    <>
      <style>{`
        .winter-page {
          --bg: #ffffff;
          --fg: #14102b;
          --surface: #ffffff;
          --surface-glass: rgba(255, 255, 255, 0.9);
          --soft: #f7f5ff;
          --ink: #1b1332;
          --ink-2: #2a2340;
          --muted: #5a527c;
          --line: #ded3f3;
          --hero-badge-bg: rgba(255, 255, 255, 0.9);
          position: relative;
          isolation: isolate;
          overflow-x: clip;
          background-color: #d7c6fa;
          background-image: url("/xmas/page-winter-desktop.png");
          background-position: top center;
          background-repeat: repeat-y;
          background-size: 100% auto;
        }

        .winter-page .winter-transparent-section {
          background-color: transparent !important;
          background-image: none !important;
        }

        .winter-page--transparent-sections #main-content > section {
          background-color: transparent !important;
          background-image: none !important;
        }

        .winter-page > footer { margin-top: 80px; }

        @media (max-width: 767px) {
          .winter-page {
            background-image: url("/xmas/page-winter-mobile.png");
            background-size: 100% auto;
          }
        }

        @media (min-width: 768px) {
          .winter-page > footer { margin-top: 96px; }
        }

        .winter-page--footer-flush > footer { margin-top: 0; }
      `}</style>
      <div className={`winter-page ${className}`}>{children}</div>
    </>
  );
}
