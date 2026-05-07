import Image from "next/image";
import type { Locale } from "@/i18n/types";
import { getMessages } from "@/i18n/messages";
import type { DesignVariant } from "@/lib/designs-layout";
import type { DesignItem } from "@/types/landing";

interface DesignCardProps {
  item: DesignItem;
  variant: DesignVariant;
  locale: Locale;
  priority?: boolean;
}

const DESIGN_PLACEHOLDER_PATTERN = /^Design \d+$/i;
const ORG_LABEL = "GEMS United";

const SIZES: Record<DesignVariant, string> = {
  hero: "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw",
  portrait: "(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw",
  landscape: "(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw",
  square: "(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 25vw",
};

function getAccessibleTitle(item: DesignItem): string {
  const trimmed = item.title?.trim();
  if (trimmed && !DESIGN_PLACEHOLDER_PATTERN.test(trimmed)) return trimmed;
  return `${ORG_LABEL} ${item.category ?? "design"}`.trim();
}

function getTitleClassName(variant: DesignVariant): string {
  if (variant === "hero") {
    return "line-clamp-3 font-display text-2xl font-extrabold leading-tight text-white md:text-3xl";
  }

  if (variant === "landscape") {
    return "line-clamp-2 font-display text-xl font-extrabold leading-tight text-white";
  }

  return "line-clamp-2 font-display text-base font-extrabold leading-tight text-white md:text-lg";
}

export function DesignCard({ item, variant, locale, priority = false }: DesignCardProps) {
  const text = getMessages(locale);
  const href = item.href?.trim();
  const accessibleTitle = getAccessibleTitle(item);
  const showCustomTitle = Boolean(
    item.title?.trim() && !DESIGN_PLACEHOLDER_PATTERN.test(item.title.trim()),
  );
  const titleVisibilityClass =
    variant === "hero" || variant === "landscape"
      ? ""
      : "translate-y-0 md:translate-y-2 md:group-hover:translate-y-0";
  const content = (
    <>
      {item.imageUrl ? (
        <Image
          src={item.imageUrl}
          alt={accessibleTitle}
          fill
          sizes={SIZES[variant]}
          priority={priority}
          className={`object-cover transition duration-700 group-hover:scale-[1.04] ${variant === "hero" ? "design-hero-img" : ""}`}
        />
      ) : (
        <FallbackTile variant={variant} title={accessibleTitle} />
      )}

      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--overlay-deep)]/85 via-[color:var(--overlay-deep)]/30 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_55%)]" />
      </div>

      {item.category ? (
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface)]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[color:var(--brand)] backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" />
          {item.category}
        </span>
      ) : null}

      {showCustomTitle ? (
        <div className={`absolute inset-x-4 bottom-4 transition duration-300 ${titleVisibilityClass}`}>
          <h3 className={getTitleClassName(variant)}>{item.title}</h3>
        </div>
      ) : null}

      {href ? (
        <span className="absolute bottom-4 right-4 hidden h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[color:var(--ink)] opacity-0 transition md:flex md:group-hover:opacity-100 md:group-hover:bg-[color:var(--accent)] md:group-hover:text-white">
          <ArrowIcon />
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div className="group relative block h-full overflow-hidden rounded-3xl border-2 border-[color:var(--brand)] bg-[color:var(--soft)] shadow-[0_16px_36px_rgba(25,12,52,0.16)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-light)] hover:shadow-[0_24px_50px_rgba(25,12,52,0.22)]">
        {content}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block h-full overflow-hidden rounded-3xl border-2 border-[color:var(--brand)] bg-[color:var(--soft)] shadow-[0_16px_36px_rgba(25,12,52,0.16)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand-light)] hover:shadow-[0_24px_50px_rgba(25,12,52,0.22)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--soft)]"
      aria-label={`${text.designs.viewProject}: ${accessibleTitle}`}
    >
      {content}
    </a>
  );
}

function FallbackTile({ variant, title }: { variant: DesignVariant; title: string }) {
  const initial = title.charAt(0).toUpperCase() || "G";
  const textClass =
    variant === "hero"
      ? "text-7xl"
      : variant === "landscape"
        ? "text-6xl"
        : variant === "portrait"
          ? "text-5xl"
          : "text-4xl";

  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)] text-white">
      <span className={`font-display font-black ${textClass}`}>{initial}</span>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2 7h10M8 3l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
