import type { Locale } from "@/i18n/types";
import type { CareerItem, CareerLocalizedFields } from "@/types/landing";

export interface ResolvedCareerFields {
  responsibilities?: string;
  requirements?: string;
  growthPath?: string;
  benefits?: string;
  location: string;
  workSchedule?: string;
  summary?: string;
}

function buildSummary(parts: Array<string | undefined>): string | undefined {
  const joined = parts.filter(Boolean).join("\n\n");
  return joined.length > 0 ? joined : undefined;
}

function pickLocalized(vi: string | undefined, en: string | undefined, locale: Locale): string | undefined {
  if (locale === "en" && en?.trim()) return en.trim();
  return vi?.trim() || undefined;
}

export function resolveCareerFields(career: CareerItem, locale: Locale): ResolvedCareerFields {
  const en: CareerLocalizedFields | undefined = career.en;

  const responsibilities = pickLocalized(career.responsibilities, en?.responsibilities, locale);
  const requirements = pickLocalized(career.requirements, en?.requirements, locale);
  const growthPath = pickLocalized(career.growthPath, en?.growthPath, locale);
  const benefits = pickLocalized(career.benefits, en?.benefits, locale);
  const location = pickLocalized(career.location, en?.location, locale) ?? career.location;
  const workSchedule = pickLocalized(career.workSchedule, en?.workSchedule, locale);

  const summary =
    locale === "en" && career.en
      ? buildSummary([responsibilities, requirements, benefits, growthPath]) ?? career.summary
      : career.summary ?? buildSummary([responsibilities, requirements, benefits, growthPath]);

  return {
    responsibilities,
    requirements,
    growthPath,
    benefits,
    location,
    workSchedule,
    summary,
  };
}
