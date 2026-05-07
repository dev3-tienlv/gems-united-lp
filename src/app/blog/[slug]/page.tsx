import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { blogPostingJsonLd } from "@/lib/seo";
import { looksLikeHtml, sanitizeBlogHtml } from "@/lib/sanitize";
import { getBlogBySlug } from "@/lib/wix-headless";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

interface BlogMediaItem {
  type: "image" | "video";
  url: string;
}

function formatPublishedAt(value?: string, locale: Locale = "vi"): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function toWixMediaUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
  if (rawUrl.startsWith("wix:image://v1/")) {
    const rest = rawUrl.replace("wix:image://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://static.wixstatic.com/media/${fileId}` : rawUrl;
  }
  if (rawUrl.startsWith("wix:video://v1/")) {
    const rest = rawUrl.replace("wix:video://v1/", "");
    const fileId = rest.split("/")[0];
    return fileId ? `https://video.wixstatic.com/video/${fileId}` : rawUrl;
  }
  if (/^[a-z0-9]+_.+\.(jpg|jpeg|png|webp|gif|avif)$/i.test(rawUrl)) {
    return `https://static.wixstatic.com/media/${rawUrl}`;
  }
  if (/^[a-z0-9]+_.+\.(mp4|webm|mov)$/i.test(rawUrl)) {
    return `https://video.wixstatic.com/video/${rawUrl}`;
  }
  return rawUrl;
}

function collectMediaFromNode(node: Record<string, unknown>, result: BlogMediaItem[]) {
  if (node.type === "GALLERY") {
    const items = (node.galleryData as { items?: unknown[] } | undefined)?.items || [];
    for (const item of items) {
      const mediaUrl = ((item as { image?: { media?: { src?: { url?: string } } } })?.image?.media?.src?.url ||
        (item as { video?: { media?: { src?: { url?: string } } } })?.video?.media?.src?.url) as
        | string
        | undefined;
      if (!mediaUrl) continue;
      const normalized = toWixMediaUrl(mediaUrl);
      const isVideo = /\.(mp4|webm|mov)(\?|$)/i.test(normalized);
      result.push({ type: isVideo ? "video" : "image", url: normalized });
    }
  }

  if (node.type === "IMAGE") {
    const mediaUrl = (node.imageData as { image?: { src?: { id?: string; url?: string } } } | undefined)
      ?.image?.src;
    const rawUrl = (mediaUrl?.url || mediaUrl?.id) as string | undefined;
    if (rawUrl) result.push({ type: "image", url: toWixMediaUrl(rawUrl) });
  }

  if (node.type === "VIDEO") {
    const mediaUrl = (node.videoData as { video?: { src?: { id?: string; url?: string } } } | undefined)
      ?.video?.src;
    const rawUrl = (mediaUrl?.url || mediaUrl?.id) as string | undefined;
    if (rawUrl) result.push({ type: "video", url: toWixMediaUrl(rawUrl) });
  }
}

function extractMediaItems(rawRichContent: unknown): BlogMediaItem[] {
  let richContent: Record<string, unknown> | null = null;
  if (typeof rawRichContent === "string") {
    try {
      richContent = JSON.parse(rawRichContent) as Record<string, unknown>;
    } catch {
      richContent = null;
    }
  } else {
    richContent = rawRichContent as Record<string, unknown> | null;
  }
  if (!richContent || typeof richContent !== "object") return [];
  const nodes = (richContent.nodes as unknown[]) || [];
  const result: BlogMediaItem[] = [];

  for (const node of nodes) {
    if (!node || typeof node !== "object") continue;
    collectMediaFromNode(node as Record<string, unknown>, result);
  }

  const unique = new Map<string, BlogMediaItem>();
  result.forEach((item) => unique.set(`${item.type}:${item.url}`, item));
  return Array.from(unique.values());
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);
  if (!blog) return { title: "Not found" };

  const path = `/blog/${blog.slug ?? slug}`;
  return {
    title: blog.title,
    description: blog.excerpt,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "article",
      title: blog.title,
      description: blog.excerpt,
      url: path,
      images: blog.imageUrl ? [{ url: blog.imageUrl }] : undefined,
      publishedTime: blog.publishedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.excerpt,
      images: blog.imageUrl ? [blog.imageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const blog = await getBlogBySlug(slug);
  if (!blog) notFound();
  const text = getMessages(locale);

  const bodyText = blog.bodyHtml || blog.body;
  const isHtml = typeof bodyText === "string" && looksLikeHtml(bodyText);
  const safeHtml = isHtml ? sanitizeBlogHtml(bodyText) : "";
  const plainParagraphs =
    typeof bodyText === "string" && !isHtml
      ? bodyText.split(/\n+/).map((line) => line.trim()).filter(Boolean)
      : [];
  const publishedAt = formatPublishedAt(blog.publishedAt, locale);
  const leadParagraph = plainParagraphs[0];
  const otherParagraphs = plainParagraphs.slice(1);
  const mediaItems = extractMediaItems(blog.richContent);

  return (
    <div className="bg-[color:var(--bg)]">
      <Header locale={locale} />
      <main id="main-content">
        <JsonLd data={blogPostingJsonLd(blog, locale)} />
        <section className="relative overflow-hidden bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]">
          <div className="pointer-events-none absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full bg-[color:var(--brand)]/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-24 top-40 h-[360px] w-[360px] rounded-full bg-[color:var(--brand-light)]/15 blur-3xl" />
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-16 pt-16 md:px-8 md:pb-20 md:pt-24">
            <Reveal>
              <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Link
                  href="/#insights"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold text-[color:var(--ink-2)] shadow-[0_4px_18px_rgba(10,8,24,0.06)] transition hover:text-[color:var(--brand)] [background-color:var(--hero-badge-bg)]"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M12 7H2M6 3L2 7l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {text.common.backToInsights}
                </Link>
                <p className="inline-flex items-center gap-2 rounded-full bg-[color:var(--brand-soft)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[color:var(--brand)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" />
                  {text.common.blog}
                </p>
              </div>
              <h1 className="mt-5 max-w-4xl font-display text-[36px] font-extrabold leading-[1.08] tracking-tight text-[color:var(--ink)] md:text-[52px]">
                {blog.title}
              </h1>
              {(publishedAt || blog.author) && (
                <p className="mt-4 text-sm font-medium text-[color:var(--muted)]">
                  {[publishedAt, blog.author].filter(Boolean).join(" · ")}
                </p>
              )}
            </Reveal>
          </div>
        </section>

        <section className="bg-[color:var(--surface)] pb-12 md:pb-14">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <div className="relative z-10 -mt-10 overflow-hidden rounded-3xl bg-[color:var(--soft)] shadow-[0_18px_48px_rgba(10,8,24,0.12)] md:-mt-12">
                {blog.imageUrl ? (
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src={blog.imageUrl}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 1280px) 100vw, 1280px"
                      className="object-cover"
                      priority
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-[color:var(--brand)] via-[color:var(--brand-light)] to-[color:var(--brand-strong)] text-white">
                    <span className="font-display text-4xl font-extrabold">GEMS United</span>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[color:var(--surface)] pb-24">
          <div className="mx-auto w-full max-w-3xl px-5 md:px-8">
            <Reveal delay={0.04}>
              {mediaItems.length > 0 ? (
                <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                  {mediaItems.map((item, index) => (
                    <div
                      key={`${item.type}-${item.url}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-2xl border border-[color:var(--line)] bg-[color:var(--soft)]"
                    >
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          controls
                          playsInline
                          className="h-full w-full object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={item.url}
                          alt={`${blog.title} media ${index + 1}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {isHtml ? (
                <article
                  className="prose prose-slate dark:prose-invert max-w-none rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 prose-headings:font-display prose-headings:text-[color:var(--ink)] prose-p:text-[color:var(--ink-2)] prose-a:text-[color:var(--brand)] md:p-9"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              ) : plainParagraphs.length > 0 ? (
                <article className="space-y-7 rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] p-6 md:p-9">
                  {leadParagraph ? (
                    <div className="rounded-2xl bg-[color:var(--soft)] p-5 md:p-6">
                      <p className="text-[17px] font-medium leading-8 text-[color:var(--ink)] md:text-[19px]">
                        {leadParagraph}
                      </p>
                    </div>
                  ) : null}
                  <div className="space-y-5 text-base leading-8 text-[color:var(--ink-2)] md:text-[17px]">
                    {otherParagraphs.map((paragraph, idx) => (
                      <p key={`${slug}-${idx + 1}`}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              ) : (
                <article className="rounded-3xl border border-[color:var(--line)] bg-[color:var(--soft)] p-6 md:p-8">
                  <p className="text-base leading-7 text-[color:var(--ink-2)]">
                    {blog.excerpt}
                  </p>
                </article>
              )}
            </Reveal>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
