import { blogItems, careers, designItems } from "@/data/landing";
import { DEFAULT_WIX_SITE_ID } from "@/lib/constants";
import type { BlogItem, CareerItem, DesignItem } from "@/types/landing";

interface WixDataQueryResponse<T = Record<string, unknown>> {
  dataItems?: Array<{ data?: T }>;
}

interface LandingContent {
  careers: CareerItem[];
  blogs: BlogItem[];
  designs: DesignItem[];
}

const WIX_API_BASE = "https://www.wixapis.com/wix-data/v2/items/query";
const WIX_COLLECTIONS_API = "https://www.wixapis.com/wix-data/v2/data-collections";
const REVALIDATE_SECONDS = 300;

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

function toWixStaticImageUrl(imageField: unknown): string | undefined {
  if (typeof imageField !== "string") return undefined;
  if (imageField.startsWith("wix:image://v1/")) {
    const rest = imageField.replace("wix:image://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://static.wixstatic.com/media/${fileId}` : undefined;
  }
  if (imageField.startsWith("http")) return imageField;
  return undefined;
}

function pickImageFromRaw(raw: Record<string, unknown>): string | undefined {
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
  const richContent =
    typeof raw.richContent === "string"
      ? raw.richContent
      : raw.richContent
        ? JSON.stringify(raw.richContent)
        : undefined;
  const bodyCandidate =
    raw.content ||
    raw.bodyHtml ||
    raw.htmlContent ||
    raw.body ||
    richContent ||
    raw.plainContent;
  const body = typeof bodyCandidate === "string" ? bodyCandidate : undefined;
  const publishedAtRaw = raw.firstPublishedDate || raw.publishedAt;

  return {
    title: String(raw.title || raw.postTitle || "Blog post"),
    excerpt: String(raw.excerpt || raw.summary || "Read the latest update from GEMS United."),
    slug: raw.slug ? String(raw.slug) : raw.slug_fld ? String(raw.slug_fld) : undefined,
    imageUrl: pickImageFromRaw(raw),
    body,
    bodyHtml: typeof raw.bodyHtml === "string" ? raw.bodyHtml : undefined,
    publishedAt: typeof publishedAtRaw === "string" ? publishedAtRaw : undefined,
    permalink:
      typeof raw.permalink === "string"
        ? raw.permalink
        : typeof raw.url === "string"
          ? raw.url
          : typeof raw.postPageUrl === "string"
            ? `https://www.gemsunited.com${raw.postPageUrl}`
          : undefined,
    postPageUrl: typeof raw.postPageUrl === "string" ? raw.postPageUrl : undefined,
    richContent: raw.richContent,
  };
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
  const { careersCollectionId } = getWixEnv();

  if (careersCollectionId) {
    try {
      const filter = { _id: { $eq: id } };
      const careersRaw = await queryCollection<Record<string, unknown>>(careersCollectionId, {
        limit: 1,
        filter,
      });
      if (careersRaw.length > 0) {
        return normalizeCareer(careersRaw[0]!, 0);
      }
    } catch {
      // Fall through to local fallback list.
    }
  }

  return careers.find((c) => c.id === id) ?? null;
}

export async function getAllCareers(): Promise<CareerItem[]> {
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
    console.warn("[wix-headless] Falling back to local careers.", error);
  }

  return careers;
}

export async function getBlogBySlug(slug: string): Promise<BlogItem | null> {
  const normalizedInput = decodeURIComponent(slug).trim();
  const normalizedKey = normalizeSlugKey(normalizedInput);
  const { blogsCollectionId } = getWixEnv();

  const matchBlog = (list: BlogItem[]): BlogItem | null => {
    const direct = list.find((blog) => blog.slug === normalizedInput);
    if (direct) return direct;

    const byDecoded = list.find((blog) =>
      blog.slug ? decodeURIComponent(blog.slug) === normalizedInput : false,
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
        const decodedPermalinkSlug = decodeURIComponent(permalinkSlug);
        return (
          decodedPermalinkSlug === normalizedInput ||
          normalizeSlugKey(decodedPermalinkSlug) === normalizedKey
        );
      }) ?? null
    );
  };

  if (blogsCollectionId) {
    try {
      const blogsRaw = await queryCollection<Record<string, unknown>>(blogsCollectionId, {
        limit: 100,
      });
      if (blogsRaw.length > 0) {
        const normalizedBlogs = blogsRaw.map(normalizeBlog);
        const matched = matchBlog(normalizedBlogs);
        if (matched) return matched;
      }
    } catch {
      // Fall through to cached/fallback landing content.
    }
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
    console.warn("[wix-headless] Falling back to local blogs.", error);
  }

  return blogItems;
}

export async function getLandingContent(): Promise<LandingContent> {
  const { careersCollectionId, blogsCollectionId, designsCollectionId } = getWixEnv();
  const result: LandingContent = {
    careers,
    blogs: blogItems,
    designs: designItems,
  };

  try {
    if (careersCollectionId) {
      const careersRaw = await queryCollection<Record<string, unknown>>(careersCollectionId, {
        limit: 12,
      });
      if (careersRaw.length > 0) {
        result.careers = careersRaw
          .filter((item) => item.hidden !== true)
          .map((raw, idx) => normalizeCareer(raw, idx));
      }
    }

    if (blogsCollectionId) {
      const blogsRaw = await queryCollection<Record<string, unknown>>(blogsCollectionId, {
        limit: 3,
      });
      if (blogsRaw.length > 0) {
        result.blogs = blogsRaw.map(normalizeBlog);
      }
    }

    if (designsCollectionId) {
      const designsRaw = await queryCollection<Record<string, unknown>>(designsCollectionId, {
        limit: 12,
      });
      if (designsRaw.length > 0) {
        result.designs = designsRaw.map((raw, idx) => normalizeDesign(raw, idx));
      }
    }
  } catch (error) {
    console.warn("[wix-headless] Falling back to local content.", error);
  }

  return result;
}
