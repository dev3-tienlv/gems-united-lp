import { cookies } from "next/headers";
import { DEFAULT_LOCALE as DEFAULT_LOCALE_CONST } from "@/lib/constants";
import type { Locale } from "./types";

export const DEFAULT_LOCALE: Locale = DEFAULT_LOCALE_CONST;
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string): value is Locale {
  return value === "vi" || value === "en";
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return DEFAULT_LOCALE;
}
