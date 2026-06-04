"use client";

import { getChromeMessages } from "@/i18n/chrome";
import type { Locale } from "@/i18n/types";
import { useCallback, useEffect, useState } from "react";

const SCROLL_THRESHOLD = 280;

interface ScrollToTopProps {
  locale: Locale;
}

function ScrollTopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 15l5-5 5 5"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getScrollY(): number {
  return Math.max(
    window.scrollY,
    document.documentElement.scrollTop,
    document.body.scrollTop,
  );
}

export function ScrollToTop({ locale }: ScrollToTopProps) {
  const chrome = getChromeMessages(locale);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(getScrollY() > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={chrome.scrollToTop}
      data-visible={visible ? "true" : "false"}
      className={[
        "group fixed z-[48] inline-flex h-12 w-12 cursor-pointer items-center justify-center rounded-full text-white md:h-11 md:w-11",
        "right-[max(1.25rem,env(safe-area-inset-right))]",
        "bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]",
        "border-2 border-[color:var(--brand)] bg-[radial-gradient(circle_at_32%_28%,color-mix(in_srgb,var(--accent)_90%,white),color-mix(in_srgb,var(--accent-strong)_92%,#0a0818))]",
        "shadow-[0_12px_28px_rgba(126,217,87,0.38),0_0_0_1px_color-mix(in_srgb,var(--brand)_25%,transparent)]",
        "transition-[opacity,transform,box-shadow,filter,background-color,border-color] duration-300 ease-out motion-reduce:transition-none",
        "hover:scale-[1.04] hover:border-[color:var(--brand-light)] hover:brightness-[1.02] hover:shadow-[0_16px_34px_rgba(126,217,87,0.45),0_0_0_1px_color-mix(in_srgb,var(--brand-light)_40%,transparent)]",
        "active:scale-[0.97]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]",
        visible
          ? "pointer-events-auto scale-100 opacity-100"
          : "pointer-events-none scale-90 opacity-0",
      ].join(" ")}
    >
      <span
        className="pointer-events-none absolute inset-[4px] rounded-full border border-[color:var(--brand)]/20"
        aria-hidden="true"
      />
      <span className="relative">
        <ScrollTopIcon />
      </span>
    </button>
  );
}
