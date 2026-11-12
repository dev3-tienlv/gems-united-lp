export function WinterHeroBackdrop() {
  return (
    <>
      <style>{`
        .winter-hero-backdrop {
          position: absolute;
          inset: 0 0 auto;
          z-index: 0;
          height: max(900px, 56.28vw);
          overflow: hidden;
          pointer-events: none;
        }

        .winter-hero-backdrop picture,
        .winter-hero-backdrop img {
          display: block;
          width: 100%;
          height: 100%;
        }

        .winter-hero-backdrop img {
          object-fit: cover;
          object-position: center top;
        }

        .winter-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(250, 248, 255, 0.94) 0%, rgba(250, 248, 255, 0.78) 34%, rgba(250, 248, 255, 0.08) 64%);
        }

        .winter-hero-section {
          min-height: calc(max(900px, 56.28vw) - 112px);
        }

        @media (max-width: 767px) {
          .winter-hero-backdrop {
            height: 1052px;
          }

          .winter-hero-scrim {
            background: linear-gradient(180deg, rgba(250, 248, 255, 0.42) 0%, rgba(250, 248, 255, 0.18) 42%, transparent 72%);
          }

          .winter-hero-section {
            min-height: 956px;
          }
        }
      `}</style>
      <div className="winter-hero-backdrop" aria-hidden="true">
        <picture>
          <source media="(max-width: 767px)" srcSet="/xmas/hero-winter-mobile.webp" type="image/webp" />
          <img
            src="/xmas/hero-winter-desktop.webp"
            alt=""
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <span className="winter-hero-scrim" />
      </div>
    </>
  );
}
