import { WinterOrnamentStyles } from "@/components/xmas/WinterPageDecor";

export function WinterSectionBackgrounds() {
  return (
    <>
      <WinterOrnamentStyles />
      <style>{`
        .home-winter-hero {
          --bg: #ffffff;
          --fg: #14102b;
          --muted: #5a527c;
          --line: #ded3f3;
          --soft: #f7f5ff;
          --surface: #ffffff;
          --ink: #1b1332;
          --ink-2: #2a2340;
          background-color: #d7c6fa;
          background-image: url("/xmas/page-winter-desktop.webp");
          background-position: top center;
          background-repeat: repeat-y;
          background-size: 100% auto;
        }

        .home-winter-hero #main-content > section {
          background-color: transparent !important;
          background-image: none !important;
        }

        .home-winter-hero > footer { margin-top: 80px; }

        @media (max-width: 767px) {
          .home-winter-hero {
            background-image: url("/xmas/page-winter-mobile.webp");
            background-size: 100% auto;
          }
        }

        @media (min-width: 768px) {
          .home-winter-hero > footer { margin-top: 96px; }
        }
      `}</style>
    </>
  );
}
