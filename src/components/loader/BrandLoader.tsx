import Image from "next/image";

const WORDMARK = ["G", "E", "M", "S"] as const;
const LETTER_STEP_MS = 90;

interface BrandLoaderProps {
  tagline?: string;
}

export function BrandLoader({
  tagline = "B2B POD Partner — Da Nang, Vietnam",
}: BrandLoaderProps) {
  return (
    <div className="loader-screen" role="status" aria-live="polite">
      <div className="loader-stage">
        <div className="loader-logo">
          <Image
            src="/logo-3d.png"
            alt=""
            width={120}
            height={120}
            priority
            sizes="120px"
          />
        </div>

        <div className="loader-mark" aria-hidden="true">
          {WORDMARK.map((char, index) => (
            <span
              key={`${char}-${index}`}
              style={{ animationDelay: `${index * LETTER_STEP_MS}ms` }}
            >
              {char}
            </span>
          ))}
          <span className="loader-mark-dot" aria-hidden="true">
            .
          </span>
        </div>

        <p className="loader-tag">{tagline}</p>

        <div
          className="loader-track"
          role="progressbar"
          aria-label="Loading"
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span className="loader-track-fill" />
        </div>
      </div>

      <span className="sr-only">Loading content…</span>
    </div>
  );
}
