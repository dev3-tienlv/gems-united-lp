import type { Metadata } from "next";

export const revalidate = 900;

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogFinalCta } from "@/components/blog/BlogFinalCta";
import { BlogLightbox } from "@/components/blog/BlogLightbox";
import { BlogReadingProgress } from "@/components/blog/BlogReadingProgress";
import { BlogRelated } from "@/components/blog/BlogRelated";
import { BlogShareStrip } from "@/components/blog/BlogShareStrip";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Reveal } from "@/components/motion/Reveal";
import { JsonLd } from "@/components/seo/JsonLd";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import type { Locale } from "@/i18n/types";
import { type BlogContactInfo, parseBlogContent } from "@/lib/blog-content-parser";
import { SITE_URL } from "@/lib/constants";
import { blogPostingJsonLd } from "@/lib/seo";
import { looksLikeHtml, sanitizeBlogHtml } from "@/lib/sanitize";
import { getBlogBySlug, getLatestBlogsExcept } from "@/lib/wix-headless";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function injectImageStyle(attrs: string): string {
  const cleanedAttrs = attrs.replace(/\sstyle\s*=\s*["'][^"']*["']/i, "");
  return `${cleanedAttrs} style="display:block;width:100%;height:100%;max-height:none;margin:0;object-fit:cover;object-position:center;border-radius:14px;"`;
}

function injectVideoStyle(attrs: string): string {
  const cleanedAttrs = attrs.replace(/\sstyle\s*=\s*["'][^"']*["']/i, "");
  return `${cleanedAttrs} style="display:block;width:100%;height:auto;max-height:min(72vh,760px);min-height:0;margin:0 auto;border-radius:16px;background:#000;object-fit:contain;"`;
}

function normalizeArticleMedia(html: string): string {
  let output = html;

  output = output.replace(/<div\s+class=["']gallery["']>/gi, () => {
    return '<div class="gallery" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));grid-auto-rows:clamp(150px,26vw,280px);gap:8px;">';
  });

  output = output.replace(/<img([^>]*)>/gi, (_full, attrs: string) => {
    return `<img${injectImageStyle(attrs)}>`;
  });

  output = output.replace(/<video([^>]*)(\/?)>/gi, (_full, attrs: string, selfClose: string) => {
    return `<video${injectVideoStyle(attrs)}${selfClose}>`;
  });

  return output;
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

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function buildBlogPageUrl(blog: {
  permalink?: string;
  postPageUrl?: string;
}, slug: string): string {
  if (blog.permalink) return blog.permalink;
  if (blog.postPageUrl) return `${SITE_URL}${blog.postPageUrl}`;
  return `${SITE_URL}/blog/${encodeURIComponent(slug)}`;
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
  const [blog, relatedBlogs] = await Promise.all([
    getBlogBySlug(slug),
    getLatestBlogsExcept(slug, 3),
  ]);
  if (!blog) notFound();
  const text = getMessages(locale);

  const bodyText = blog.bodyHtml || blog.body;
  const isHtml = typeof bodyText === "string" && looksLikeHtml(bodyText);
  const safeHtml = isHtml ? sanitizeBlogHtml(bodyText) : "";
  const parsedHtmlContent = isHtml ? parseBlogContent(safeHtml) : null;
  const articleHtml = normalizeArticleMedia(parsedHtmlContent?.html ?? safeHtml);
  const tags = parsedHtmlContent?.tags ?? [];
  const contact: BlogContactInfo = parsedHtmlContent?.contact ?? {};
  const plainParagraphs =
    typeof bodyText === "string" && !isHtml
      ? bodyText.split(/\n+/).map((line) => line.trim()).filter(Boolean)
      : [];
  const publishedAt = formatPublishedAt(blog.publishedAt, locale);
  const leadParagraph = plainParagraphs[0];
  const otherParagraphs = plainParagraphs.slice(1);
  const wordsPerMin = locale === "vi" ? 230 : 200;
  const plainText = (bodyText ?? "").replace(/<[^>]+>/g, " ");
  const wordCount = countWords(plainText);
  const readingMinutes = Math.max(1, Math.round(wordCount / wordsPerMin) || 1);
  const pageUrl = buildBlogPageUrl(blog, safeDecodeURIComponent(slug));
  const showContactSection = Boolean(contact.website || contact.fanpage || contact.email || contact.address);

  return (
    <div className="bg-[color:var(--bg)]">
      <Header locale={locale} />
      <BlogReadingProgress />
      <main id="main-content" className="pb-[calc(var(--spacing)*12)]">
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
                  {[publishedAt, blog.author, `⏱ ${readingMinutes} ${text.common.minRead}`].filter(Boolean).join(" · ")}
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
            <Reveal delay={0.02}>
              <div className="mt-5 flex justify-center md:sticky md:top-24 md:z-20 md:justify-start">
                <BlogShareStrip
                  url={pageUrl}
                  title={blog.title}
                  shareLabel={text.common.share}
                  copyLabel={text.common.copyLink}
                  copiedLabel={text.common.linkCopied}
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[color:var(--surface)] pb-28 md:pb-32">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal delay={0.04}>
              {isHtml ? (
                <article
                  className="blog-article max-w-none"
                  dangerouslySetInnerHTML={{ __html: articleHtml }}
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

              {tags.length > 0 ? (
                <div className="mt-8 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-[color:var(--brand-soft)] px-3 py-1.5 text-xs font-semibold text-[color:var(--brand)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </Reveal>

            {showContactSection ? (
              <Reveal delay={0.06}>
                <section className="mt-10 rounded-3xl border border-[color:var(--line)] bg-[color:var(--soft)] p-6 md:p-7">
                  <h3 className="font-display text-lg font-bold text-[color:var(--ink)]">{text.common.connectWithUs}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                    {contact.website ? (
                      <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{text.common.website}</p>
                        <a className="mt-1 block break-words text-sm font-medium text-[color:var(--brand)]" href={contact.website.startsWith("http") ? contact.website : `https://${contact.website}`} target="_blank" rel="noopener noreferrer">
                          {contact.website}
                        </a>
                      </div>
                    ) : null}
                    {contact.fanpage ? (
                      <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{text.common.fanpage}</p>
                        <a className="mt-1 block break-words text-sm font-medium text-[color:var(--brand)]" href={contact.fanpage.startsWith("http") ? contact.fanpage : `https://${contact.fanpage}`} target="_blank" rel="noopener noreferrer">
                          {contact.fanpage}
                        </a>
                      </div>
                    ) : null}
                    {contact.email ? (
                      <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{text.common.email}</p>
                        <a className="mt-1 block break-words text-sm font-medium text-[color:var(--brand)]" href={`mailto:${contact.email}`}>
                          {contact.email}
                        </a>
                      </div>
                    ) : null}
                    {contact.address ? (
                      <div className="rounded-2xl bg-[color:var(--surface)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--muted)]">{text.common.address}</p>
                        <p className="mt-1 break-words text-sm font-medium text-[color:var(--ink)]">{contact.address}</p>
                      </div>
                    ) : null}
                  </div>
                </section>
              </Reveal>
            ) : null}

            <Reveal delay={0.08}>
              <BlogRelated blogs={relatedBlogs} locale={locale} title={text.common.relatedPosts} />
            </Reveal>
            <Reveal delay={0.1}>
              <div className="pb-20 md:pb-24">
                <BlogFinalCta title={text.common.finalCtaTitle} buttonLabel={text.common.finalCtaButton} />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <BlogLightbox />
      <Footer locale={locale} />
    </div>
  );
}
