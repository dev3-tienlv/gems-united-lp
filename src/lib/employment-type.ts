import type { Locale } from "@/i18n/types";

const LEGACY_TYPE_MAX_LENGTH = 60;

function readTextField(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  return undefined;
}

type EmploymentKind = "full-time" | "part-time" | "custom";

function parseEmploymentKind(value?: string): EmploymentKind | null {
  if (!value?.trim()) return null;
  const key = value.trim().toLowerCase().replace(/[_\s]+/g, "-");
  if (/^(full-?time|fulltime|ft)$/.test(key)) return "full-time";
  if (/^(part-?time|parttime|partime|pt)$/.test(key)) return "part-time";
  if (key.length > LEGACY_TYPE_MAX_LENGTH) return null;
  return "custom";
}

/** Read Wix `employmentType` first; fall back to short legacy `type`. Default: `full-time`. */
export function employmentTypeFromWix(raw: Record<string, unknown>): string {
  const fromEmploymentType = readTextField(raw.employmentType);
  if (fromEmploymentType) return fromEmploymentType;

  const fromJobType = readTextField(raw.jobType);
  if (fromJobType) return fromJobType;

  const legacyType = readTextField(raw.type);
  if (legacyType && legacyType.length <= LEGACY_TYPE_MAX_LENGTH) return legacyType;

  return "full-time";
}

/** Localized label for quick facts, hero, and cards. Empty/invalid → Full-time. */
export function formatEmploymentType(value: string | undefined, locale: Locale): string {
  const kind = parseEmploymentKind(value);
  if (kind === "full-time") return locale === "vi" ? "Toàn thời gian" : "Full-time";
  if (kind === "part-time") return locale === "vi" ? "Bán thời gian" : "Part-time";
  if (kind === "custom" && value?.trim()) return value.trim();
  return locale === "vi" ? "Toàn thời gian" : "Full-time";
}

/** Schema.org JobPosting employmentType (HR still enters `part-time` / `full-time` in Wix). */
export function employmentTypeForSchema(value?: string): "FULL_TIME" | "PART_TIME" {
  return parseEmploymentKind(value) === "part-time" ? "PART_TIME" : "FULL_TIME";
}
