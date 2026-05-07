import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { ALMA_GEMS_BESTSELLERS_URL } from "@/lib/constants";

export function DesignsCta({ locale }: { locale: Locale }) {
  const text = getMessages(locale);

  return (
    <div className="mt-14 flex items-center justify-center md:mt-16">
      <a
        href={ALMA_GEMS_BESTSELLERS_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(111,66,201,0.35)] transition hover:bg-[color:var(--brand-strong)]"
      >
        {text.designs.ctaSecondary}
        <ExternalArrowIcon />
      </a>
    </div>
  );
}

function ExternalArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M4 10L10 4M5 4h5v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
