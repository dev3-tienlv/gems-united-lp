export type DesignVariant = "hero" | "portrait" | "landscape" | "square";

const PATTERN: readonly DesignVariant[] = [
  "hero",
  "portrait",
  "portrait",
  "square",
  "landscape",
  "square",
  "square",
  "square",
];

export function assignVariant(index: number): DesignVariant {
  return PATTERN[index % PATTERN.length] ?? "square";
}
