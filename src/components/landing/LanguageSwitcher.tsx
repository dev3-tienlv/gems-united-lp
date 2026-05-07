"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/types";

interface LanguageSwitcherProps {
  locale: Locale;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const router = useRouter();

  const setLocale = (nextLocale: Locale) => {
    if (nextLocale === locale) return;
    fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: nextLocale }),
    }).finally(() => router.refresh());
  };

  return (
    <div className="inline-flex items-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] p-1">
      {(["vi", "en"] as const).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => setLocale(item)}
          className={[
            "cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold uppercase transition",
            locale === item
              ? "bg-[color:var(--brand)] text-white"
              : "text-[color:var(--ink-2)] hover:text-[color:var(--brand)]",
          ].join(" ")}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
