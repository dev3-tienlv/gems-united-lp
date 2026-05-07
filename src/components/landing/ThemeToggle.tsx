"use client";

import { THEME_STORAGE_KEY } from "@/lib/theme-script";
import { useSyncExternalStore } from "react";

interface ThemeToggleProps {
  switchToLight: string;
  switchToDark: string;
}

function subscribeTheme(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

function getDarkSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getDarkServerSnapshot(): boolean {
  return false;
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 14.5A7.5 7.5 0 0 1 9.5 3 7.45 7.45 0 0 0 12 21a7.5 7.5 0 0 0 9-6.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function ThemeToggle({ switchToLight, switchToDark }: ThemeToggleProps) {
  const dark = useSyncExternalStore(subscribeTheme, getDarkSnapshot, getDarkServerSnapshot);

  const toggle = () => {
    const el = document.documentElement;
    if (el.classList.contains("dark")) {
      el.classList.remove("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } else {
      el.classList.add("dark");
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    }
  };

  const aria = dark ? switchToLight : switchToDark;

  return (
    <button
      type="button"
      onClick={toggle}
      suppressHydrationWarning
      aria-label={aria}
      className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] text-[color:var(--ink)] transition hover:border-[color:var(--brand-light)]/50 hover:text-[color:var(--brand)]"
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
