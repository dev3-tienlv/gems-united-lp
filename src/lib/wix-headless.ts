import { blogItems, careers, designItems } from "@/data/landing";
import { unstable_cache } from "next/cache";
import { DEFAULT_WIX_SITE_ID, SITE_URL } from "@/lib/constants";
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
const REVALIDATE_SECONDS = 300;
const BLOG_CACHE_KEY = "wix-all-blogs-v4";

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
      next: { revalidate: REVALIDATE_SECONDS },
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
    next: { revalidate: REVALIDATE_SECONDS },
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

function normalizeCareer(raw: Record<string, unknown>, idx: number): CareerItem {
  const title = String(raw.title || raw.title_fld || raw.position || "Open Position");
  const rawId = raw._id ?? raw.id ?? raw.slug;
  const id = typeof rawId === "string" && rawId.length > 0 ? rawId : `${slugify(title)}-${idx}`;
  const toText = (value: unknown): string | undefined =>
    typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;

  const responsibilities = toText(raw.title_fld1 || raw.responsibilities || raw.description);
  const requirements = toText(raw.title_fld_1 || raw.requirements);
  const benefits = toText(raw.title_fld_111 || raw.benefits);
  const growth = toText(raw.title_fld_11 || raw.notes);
  const summary = [responsibilities, requirements, benefits, growth].filter(Boolean).join("\n\n");

  return {
    id,
    title,
    location: String(raw.location || raw.locationAImLmVic || "Da Nang"),
    type: String(raw.type || raw.employmentType || raw.jobType || "Full-time"),
    summary: summary || undefined,
    responsibilities,
    requirements,
    growthPath: growth,
    benefits,
    workSchedule: toText(raw.locationAImLmVic1 || raw.workSchedule),
    imageUrl: pickImageFromRaw(raw),
    applyUrl: typeof raw.applyLinkLinkApply === "string" ? raw.applyLinkLinkApply : undefined,
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
      next: { revalidate: REVALIDATE_SECONDS },
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

export async function getCareerById(id: string): Promise<CareerItem | null> {
  const allCareers = await getAllCareers();
  return allCareers.find((career) => career.id === id) ?? null;
}

const getAllCareersCached = unstable_cache(
  async (): Promise<CareerItem[]> => {
  const { careersCollectionId } = getWixEnv();
  if (!careersCollectionId) return careers;

  try {
    const careersRaw = await queryCollection<Record<string, unknown>>(careersCollectionId, {
      limit: 12,
    });
    if (careersRaw.length > 0) {
      return careersRaw
        .filter((item) => item.hidden !== true)
        .map((raw, idx) => normalizeCareer(raw, idx));
    }
  } catch (error) {
    logger.warn("[wix-headless] Falling back to local careers.", toSafeErrorMessage(error));
  }

  return careers;
  },
  ["wix-all-careers"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getAllCareers(): Promise<CareerItem[]> {
  return getAllCareersCached();
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

const getAllBlogsCached = unstable_cache(
  async (): Promise<BlogItem[]> => {
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
  },
  [BLOG_CACHE_KEY],
  { revalidate: REVALIDATE_SECONDS },
);

export async function getAllBlogs(): Promise<BlogItem[]> {
  return getAllBlogsCached();
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
  const { careersCollectionId, blogsCollectionId, designsCollectionId } = getWixEnv();
  const result: LandingContent = {
    careers,
    blogs: blogItems,
    designs: designItems,
  };

  const [careersQuery, blogsQuery, designsQuery] = await Promise.allSettled([
    careersCollectionId
      ? queryCollection<Record<string, unknown>>(careersCollectionId, {
          limit: 12,
        })
      : Promise.resolve([]),
    blogsCollectionId
      ? queryCollection<Record<string, unknown>>(blogsCollectionId, {
          limit: 3,
        })
      : Promise.resolve([]),
    designsCollectionId
      ? queryCollection<Record<string, unknown>>(designsCollectionId, {
          limit: 12,
        })
      : Promise.resolve([]),
  ]);

  if (careersQuery.status === "fulfilled" && careersQuery.value.length > 0) {
    result.careers = careersQuery.value
      .filter((item) => item.hidden !== true)
      .map((raw, idx) => normalizeCareer(raw, idx));
  } else if (careersQuery.status === "rejected") {
    logger.warn("[wix-headless] Falling back to local careers.", toSafeErrorMessage(careersQuery.reason));
  }

  if (blogsQuery.status === "fulfilled" && blogsQuery.value.length > 0) {
    result.blogs = blogsQuery.value.map(normalizeBlog);
  } else if (blogsQuery.status === "rejected") {
    logger.warn("[wix-headless] Falling back to local blogs.", toSafeErrorMessage(blogsQuery.reason));
  }

  if (designsQuery.status === "fulfilled" && designsQuery.value.length > 0) {
    result.designs = designsQuery.value.map((raw, idx) => normalizeDesign(raw, idx));
  } else if (designsQuery.status === "rejected") {
    logger.warn("[wix-headless] Falling back to local designs.", toSafeErrorMessage(designsQuery.reason));
  }

  return result;
}
