import { blogItems, careers, designItems } from "@/data/landing";
import { DEFAULT_WIX_SITE_ID, SITE_URL } from "@/lib/constants";
import { employmentTypeFromWix } from "@/lib/employment-type";
import { WIX_CACHE_TAGS, wixFetchCacheOptions, type WixCacheTag } from "@/lib/wix-cache";
import type { BlogItem, CareerItem, DesignItem } from "@/types/landing";
import { logger } from "@/lib/logger";
import { richContentToHtml } from "@/lib/rich-content";
import { toWixStaticImageUrl } from "@/lib/wix-media";

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

interface WixDataQueryResponse<T = Record<string, unknown>> {
  dataItems?: Array<{ data?: T }>;
}

interface LandingContent {
  careers: CareerItem[];
  blogs: BlogItem[];
  designs: DesignItem[];
}

function toSafeErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}

const WIX_API_BASE = "https://www.wixapis.com/wix-data/v2/items/query";
const WIX_COLLECTIONS_API = "https://www.wixapis.com/wix-data/v2/data-collections";
const WIX_BLOG_API_BASE = "https://www.wixapis.com/blog/v3/posts";

function cacheTagForCollection(collectionId: string): WixCacheTag | undefined {
  const env = getWixEnv();
  if (collectionId === env.careersCollectionId) return WIX_CACHE_TAGS.careers;
  if (collectionId === env.blogsCollectionId) return WIX_CACHE_TAGS.blogs;
  if (collectionId === env.designsCollectionId) return WIX_CACHE_TAGS.designs;
  return undefined;
}

export function getWixEnv() {
  return {
    apiKey: process.env.WIX_HEADLESS_API_KEY,
    siteId: process.env.WIX_HEADLESS_SITE_ID || DEFAULT_WIX_SITE_ID,
    careersCollectionId: process.env.WIX_CAREERS_COLLECTION_ID,
    blogsCollectionId: process.env.WIX_BLOGS_COLLECTION_ID,
    designsCollectionId: process.env.WIX_DESIGNS_COLLECTION_ID,
  };
}

interface WixCollectionsResponse {
  collections?: Array<{ id: string; displayName?: string }>;
}

export async function listCollections(): Promise<Array<{ id: string; displayName?: string }>> {
  const { apiKey, siteId } = getWixEnv();
  if (!apiKey) return [];
  try {
    const response = await fetch(WIX_COLLECTIONS_API, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        "wix-site-id": siteId,
      },
      cache: "no-store",
    });

    if (!response.ok) return [];

    const payload = (await response.json()) as WixCollectionsResponse;
    return (payload.collections || []).map((collection) => ({
      id: collection.id,
      displayName: collection.displayName,
    }));
  } catch {
    return [];
  }
}

interface QueryOptions {
  limit?: number;
  filter?: Record<string, unknown>;
}

async function queryCollection<T = Record<string, unknown>>(
  collectionId: string,
  options: QueryOptions = {},
): Promise<T[]> {
  const { apiKey, siteId } = getWixEnv();
  if (!apiKey) return [];

  const { limit = 6, filter } = options;
  const cacheTag = cacheTagForCollection(collectionId);
  const response = await fetch(WIX_API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
      "wix-site-id": siteId,
    },
    body: JSON.stringify({
      dataCollectionId: collectionId,
      query: {
        ...(filter ? { filter } : {}),
        paging: { limit },
      },
    }),
    ...(cacheTag ? wixFetchCacheOptions([cacheTag]) : wixFetchCacheOptions([WIX_CACHE_TAGS.careers])),
  });

  if (!response.ok) {
    throw new Error(`Wix data query failed: ${response.status}`);
  }

  const payload = (await response.json()) as WixDataQueryResponse<T>;
  return (payload.dataItems || []).map((item) => item.data).filter(Boolean) as T[];
}

function pickImageFromRaw(raw: Record<string, unknown>): string | undefined {
  const coverMedia = raw.coverMedia as Record<string, unknown> | undefined;
  const coverMediaImage = coverMedia?.image as Record<string, unknown> | undefined;
  const coverMediaUrl = coverMediaImage?.url;
  if (typeof coverMediaUrl === "string") {
    const url = toWixStaticImageUrl(coverMediaUrl);
    if (url) return url;
  }

  const candidates = [
    raw.image_fld,
    raw.coverImage,
    raw.cover,
    raw.image,
    raw.featuredImage,
    raw.media,
    raw.mediaItems,
    raw.gallery,
    raw.images,
    raw.thumbnail,
    raw.heroImage,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === "string") {
      const url = toWixStaticImageUrl(candidate);
      if (url) return url;
    } else if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (typeof item === "string") {
          const url = toWixStaticImageUrl(item);
          if (url) return url;
        } else if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          const nested = obj.url || obj.src || obj.image || obj.imageUrl;
          if (typeof nested === "string") {
            const url = toWixStaticImageUrl(nested);
            if (url) return url;
          }
        }
      }
    } else if (candidate && typeof candidate === "object") {
      const obj = candidate as Record<string, unknown>;
      const nested = obj.url || obj.src || obj.image || obj.imageUrl;
      if (typeof nested === "string") {
        const url = toWixStaticImageUrl(nested);
        if (url) return url;
      }
    }
  }
  return undefined;
}

function pickExcerptFromRaw(raw: Record<string, unknown>): string {
  if (typeof raw.excerpt === "string" && raw.excerpt.trim()) return raw.excerpt;
  if (raw.excerpt && typeof raw.excerpt === "object") {
    const excerptObj = raw.excerpt as Record<string, unknown>;
    if (typeof excerptObj.plainText === "string" && excerptObj.plainText.trim()) return excerptObj.plainText;
    if (typeof excerptObj.html === "string" && excerptObj.html.trim()) return excerptObj.html;
  }
  if (typeof raw.summary === "string" && raw.summary.trim()) return raw.summary;
  return "Read the latest update from GEMS United.";
}

/** Wix CMS may return plain strings or rich-text / document objects. */
function wixFieldToText(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (!value || typeof value !== "object") return undefined;

  const obj = value as Record<string, unknown>;
  if (typeof obj.plainText === "string" && obj.plainText.trim()) return obj.plainText.trim();
  if (typeof obj.text === "string" && obj.text.trim()) return obj.text.trim();
  if (typeof obj.html === "string" && obj.html.trim()) {
    return obj.html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const fromRich = richContentToHtml(value);
  if (fromRich) {
    return fromRich
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<li>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  return undefined;
}

const COMBINING_DIACRITICS = /[\u0300-\u036f]/g;
const NON_SLUG_CHARS = /[^a-z0-9]+/g;

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(COMBINING_DIACRITICS, "")
      .replace(NON_SLUG_CHARS, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "career"
  );
}

function normalizeSlugKey(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(NON_SLUG_CHARS, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Ensure all slugs in the list are unique by appending a numeric suffix
 * when duplicates are detected (e.g. "designer-pod" → "designer-pod-1").
 */
function ensureUniqueSlugs(careers: CareerItem[]): CareerItem[] {
  const seen = new Set<string>();
  return careers.map((career) => {
    let slug = career.slug;
    if (seen.has(slug)) {
      let counter = 1;
      while (seen.has(`${slug}-${counter}`)) counter++;
      slug = `${slug}-${counter}`;
    }
    seen.add(slug);
    return slug === career.slug ? career : { ...career, slug };
  });
}

function normalizeCareer(raw: Record<string, unknown>, idx: number): CareerItem {
  const title = String(raw.title || raw.title_fld || raw.position || "Open Position");
  const rawId = raw._id ?? raw.id ?? raw.slug;
  const id = typeof rawId === "string" && rawId.length > 0 ? rawId : `${slugify(title)}-${idx}`;
  const responsibilities = wixFieldToText(raw.title_fld1 || raw.responsibilities || raw.description);
  const requirements = wixFieldToText(raw.title_fld_1 || raw.requirements);
  const benefits = wixFieldToText(raw.title_fld_111 || raw.benefits);
  const growth = wixFieldToText(raw.title_fld_11 || raw.notes);
  const summary = [responsibilities, requirements, benefits, growth].filter(Boolean).join("\n\n");

  const enResponsibilities = wixFieldToText(raw.descriptionEnglish);
  const enRequirements = wixFieldToText(raw.requirementsEnglish);
  const enGrowth = wixFieldToText(raw.careerPathEnglish);
  const enBenefits = wixFieldToText(raw.benefitsEnglish);
  const enLocation = wixFieldToText(raw.locationEnglish);
  const enWorkSchedule = wixFieldToText(raw.working_hours_english);
  const enFields = {
    responsibilities: enResponsibilities,
    requirements: enRequirements,
    growthPath: enGrowth,
    benefits: enBenefits,
    location: enLocation,
    workSchedule: enWorkSchedule,
  };
  const hasEnglishContent = Object.values(enFields).some(Boolean);

  // Generate a URL-friendly slug from the job title.
  // Prefer the Wix-stored slug field if available, otherwise derive from title.
  const rawSlug = raw.slug ?? raw.urlSlug ?? raw.pageUrl;
  const slug =
    typeof rawSlug === "string" && rawSlug.trim().length > 0
      ? slugify(rawSlug.trim())
      : slugify(title);

  return {
    id,
    slug,
    title,
    location: String(raw.location || raw.locationAImLmVic || "Da Nang"),
    type: employmentTypeFromWix(raw),
    summary: summary || undefined,
    responsibilities,
    requirements,
    growthPath: growth,
    benefits,
    workSchedule: wixFieldToText(raw.locationAImLmVic1 || raw.workSchedule),
    imageUrl: pickImageFromRaw(raw),
    applyUrl: typeof raw.applyLinkLinkApply === "string" ? raw.applyLinkLinkApply : undefined,
    ...(hasEnglishContent ? { en: enFields } : {}),
  };
}

function normalizeBlog(raw: Record<string, unknown>): BlogItem {
  const bodyHtmlCandidate =
    (typeof raw.bodyHtml === "string" ? raw.bodyHtml : undefined) ||
    (typeof raw.htmlContent === "string" ? raw.htmlContent : undefined) ||
    richContentToHtml(raw.richContent);
  const bodyCandidate =
    (typeof raw.content === "string" ? raw.content : undefined) ||
    (typeof raw.body === "string" ? raw.body : undefined) ||
    (typeof raw.plainContent === "string" ? raw.plainContent : undefined);
  const publishedAtRaw = raw.firstPublishedDate || raw.publishedAt;

  return {
    title: String(raw.title || raw.postTitle || "Blog post"),
    excerpt: pickExcerptFromRaw(raw),
    slug: raw.slug ? String(raw.slug) : raw.slug_fld ? String(raw.slug_fld) : undefined,
    imageUrl: pickImageFromRaw(raw),
    body: bodyCandidate,
    bodyHtml: bodyHtmlCandidate,
    publishedAt: typeof publishedAtRaw === "string" ? publishedAtRaw : undefined,
    permalink:
      typeof raw.permalink === "string"
        ? raw.permalink
        : typeof raw.url === "string"
          ? raw.url
          : typeof raw.postPageUrl === "string"
            ? `${SITE_URL}${raw.postPageUrl}`
          : undefined,
    postPageUrl: typeof raw.postPageUrl === "string" ? raw.postPageUrl : undefined,
  };
}

interface WixBlogBySlugResponse {
  post?: Record<string, unknown>;
}

async function getWixBlogBySlug(slug: string): Promise<BlogItem | null> {
  const { apiKey, siteId } = getWixEnv();
  if (!apiKey) return null;

  const endpoint = `${WIX_BLOG_API_BASE}/slugs/${encodeURIComponent(slug)}?fieldsets=BASIC,URL,CONTENT`;
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: apiKey,
        "wix-site-id": siteId,
      },
      ...wixFetchCacheOptions([WIX_CACHE_TAGS.blogs]),
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as WixBlogBySlugResponse;
    if (!payload.post || typeof payload.post !== "object") return null;
    return normalizeBlog(payload.post);
  } catch (error) {
    logger.warn("[wix-headless] Failed to fetch blog by slug endpoint.", toSafeErrorMessage(error));
    return null;
  }
}

async function getBlogBySlugFromDataCollection(slug: string): Promise<BlogItem | null> {
  const { blogsCollectionId } = getWixEnv();
  if (!blogsCollectionId) return null;

  const candidates = Array.from(new Set([slug, safeDecodeURIComponent(slug)]));
  for (const candidate of candidates) {
    try {
      const result = await queryCollection<Record<string, unknown>>(blogsCollectionId, {
        limit: 1,
        filter: { slug: candidate },
      });
      if (result.length > 0) {
        return normalizeBlog(result[0]);
      }
    } catch (error) {
      logger.warn("[wix-headless] Failed to query blog by slug from collection.", toSafeErrorMessage(error));
    }
  }

  return null;
}

function normalizeDesign(raw: Record<string, unknown>, idx: number): DesignItem {
  const title = String(raw.title || raw.name || `Design ${idx + 1}`);
  const rawId = raw._id ?? raw.id;
  const id = typeof rawId === "string" && rawId.length > 0 ? rawId : `${slugify(title)}-${idx}`;

  return {
    id,
    title,
    imageUrl: pickImageFromRaw(raw),
    category: typeof raw.category === "string" ? raw.category : typeof raw.tag === "string" ? raw.tag : undefined,
    href: typeof raw.link === "string" ? raw.link : typeof raw.projectUrl === "string" ? raw.projectUrl : undefined,
  };
}

/**
 * Find a career by its slug (preferred) or fall back to id for backward
 * compatibility with any existing bookmarked UUID-based URLs.
 *
 * Accepts an optional pre-fetched list to avoid redundant API calls when
 * the caller already has the full list (e.g. CareerDetailPage).
 */
export async function getCareerBySlug(
  slug: string,
  prefetchedCareers?: CareerItem[],
): Promise<CareerItem | null> {
  const allCareers = prefetchedCareers ?? (await getAllCareers());
  // Primary: match by slug
  const bySlug = allCareers.find((c) => c.slug === slug);
  if (bySlug) return bySlug;
  // Fallback: match by id (supports old UUID-based links)
  return allCareers.find((c) => c.id === slug) ?? null;
}

/** @deprecated Use getCareerBySlug instead */
export async function getCareerById(id: string): Promise<CareerItem | null> {
  return getCareerBySlug(id);
}

export async function getAllCareers(): Promise<CareerItem[]> {
  const { careersCollectionId } = getWixEnv();
  if (!careersCollectionId) return careers;

  try {
    const careersRaw = await queryCollection<Record<string, unknown>>(careersCollectionId, {
      limit: 100,
    });
    if (careersRaw.length > 0) {
      const normalized = careersRaw
        .filter((item) => item.hidden !== true)
        .map((raw, idx) => normalizeCareer(raw, idx));
      return ensureUniqueSlugs(normalized);
    }
  } catch (error) {
    logger.warn("[wix-headless] Falling back to local careers.", toSafeErrorMessage(error));
  }

  return careers;
}

export async function getBlogBySlug(slug: string): Promise<BlogItem | null> {
  const normalizedInput = safeDecodeURIComponent(slug).trim();
  const normalizedKey = normalizeSlugKey(normalizedInput);
  const matchBlog = (list: BlogItem[]): BlogItem | null => {
    const direct = list.find((blog) => blog.slug === normalizedInput);
    if (direct) return direct;

    const byDecoded = list.find((blog) =>
      blog.slug ? safeDecodeURIComponent(blog.slug) === normalizedInput : false,
    );
    if (byDecoded) return byDecoded;

    const bySlugKey = list.find((blog) =>
      blog.slug ? normalizeSlugKey(blog.slug) === normalizedKey : false,
    );
    if (bySlugKey) return bySlugKey;

    return (
      list.find((blog) => {
        if (!blog.permalink) return false;
        const permalinkSlug = blog.permalink.split("/").filter(Boolean).pop();
        if (!permalinkSlug) return false;
        const decodedPermalinkSlug = safeDecodeURIComponent(permalinkSlug);
        return (
          decodedPermalinkSlug === normalizedInput ||
          normalizeSlugKey(decodedPermalinkSlug) === normalizedKey
        );
      }) ?? null
    );
  };

  const directBlog = await getWixBlogBySlug(normalizedInput);
  if (directBlog) {
    return directBlog;
  }

  const dataCollectionBlog = await getBlogBySlugFromDataCollection(normalizedInput);
  if (dataCollectionBlog) {
    return dataCollectionBlog;
  }

  const allBlogs = await getAllBlogs();
  const matchedBlog = matchBlog(allBlogs);
  if (matchedBlog) {
    return matchedBlog;
  }

  return matchBlog(blogItems);
}

export async function getAllBlogs(): Promise<BlogItem[]> {
  const { blogsCollectionId } = getWixEnv();
  if (!blogsCollectionId) return blogItems;

  try {
    const blogsRaw = await queryCollection<Record<string, unknown>>(blogsCollectionId, {
      limit: 100,
    });
    if (blogsRaw.length > 0) {
      return blogsRaw.map(normalizeBlog);
    }
  } catch (error) {
    logger.warn("[wix-headless] Falling back to local blogs.", toSafeErrorMessage(error));
  }

  return blogItems;
}

export async function getAllDesigns(): Promise<DesignItem[]> {
  const { designsCollectionId } = getWixEnv();
  if (!designsCollectionId) return designItems;

  try {
    const designsRaw = await queryCollection<Record<string, unknown>>(designsCollectionId, {
      limit: 100,
    });
    if (designsRaw.length > 0) {
      return designsRaw.map((raw, idx) => normalizeDesign(raw, idx));
    }
  } catch (error) {
    logger.warn("[wix-headless] Falling back to local designs.", toSafeErrorMessage(error));
  }

  return designItems;
}

export async function getLatestBlogsExcept(currentSlug: string, limit = 3): Promise<BlogItem[]> {
  const normalizedCurrent = normalizeSlugKey(safeDecodeURIComponent(currentSlug));
  const allBlogs = await getAllBlogs();

  return allBlogs
    .filter((blog) => {
      if (!blog.slug) return false;
      return normalizeSlugKey(blog.slug) !== normalizedCurrent;
    })
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

export async function getLandingContent(): Promise<LandingContent> {
  const [careersList, blogsList, designsList] = await Promise.all([
    getAllCareers(),
    getAllBlogs(),
    getAllDesigns(),
  ]);

  return {
    careers: careersList,
    blogs: blogsList.slice(0, 3),
    designs: designsList,
  };
}
