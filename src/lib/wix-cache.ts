import { revalidatePath, revalidateTag } from "next/cache";

/** Cache tags for on-demand revalidation (webhook / manual purge). */
export const WIX_CACHE_TAGS = {
  careers: "wix-careers",
  blogs: "wix-blogs",
  designs: "wix-designs",
} as const;

export type WixCacheTag = (typeof WIX_CACHE_TAGS)[keyof typeof WIX_CACHE_TAGS];

export const ALL_WIX_CACHE_TAGS: WixCacheTag[] = Object.values(WIX_CACHE_TAGS);

const PATHS_BY_TAG: Record<WixCacheTag, string[]> = {
  [WIX_CACHE_TAGS.careers]: ["/", "/careers"],
  [WIX_CACHE_TAGS.blogs]: ["/", "/blogs"],
  [WIX_CACHE_TAGS.designs]: ["/"],
};

/** ISR fallback TTL for pages and Wix fetches (seconds). Dev defaults to 0 (always fresh). */
export function getWixRevalidateSeconds(): number {
  if (process.env.NODE_ENV === "development") return 0;
  const parsed = Number(process.env.WIX_REVALIDATE_SECONDS);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 60;
}

/** Page ISR fallback (must be a static literal for segment config). */
export const WIX_PAGE_REVALIDATE = 60;

export function wixFetchCacheOptions(tags: WixCacheTag[]): RequestInit {
  const revalidate = getWixRevalidateSeconds();
  if (revalidate === 0) {
    return { cache: "no-store" };
  }
  return { next: { revalidate, tags: [...tags] } };
}

/** Bust data cache + route cache for Wix-driven pages (call from revalidate webhook). */
export function revalidateWixContent(tags: WixCacheTag[]): void {
  const uniqueTags = [...new Set(tags)];
  for (const tag of uniqueTags) {
    revalidateTag(tag, "max");
    for (const path of PATHS_BY_TAG[tag] ?? []) {
      revalidatePath(path, "layout");
    }
  }
}

export function isWixCacheTag(value: string): value is WixCacheTag {
  return (ALL_WIX_CACHE_TAGS as string[]).includes(value);
}
