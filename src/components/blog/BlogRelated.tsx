import Image from "next/image";
import Link from "next/link";
import type { BlogItem } from "@/types/landing";

interface BlogRelatedProps {
  blogs: BlogItem[];
  locale: "vi" | "en";
  title: string;
}

function formatDate(value: string | undefined, locale: "vi" | "en"): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export function BlogRelated({ blogs, locale, title }: BlogRelatedProps) {
  if (blogs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-extrabold tracking-tight text-[color:var(--ink)]">{title}</h2>
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {blogs.map((item, index) => {
          const href = item.slug ? `/blog/${encodeURIComponent(item.slug)}` : "/#insights";
          const publishedAt = formatDate(item.publishedAt, locale);
          const key = item.slug || `${item.title}-${index}`;
          return (
            <Link
              key={key}
              href={href}
              className="group overflow-hidden rounded-3xl border border-[color:var(--line)] bg-[color:var(--surface)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(10,8,24,0.08)]"
            >
              <div className="relative aspect-[16/9] w-full bg-[color:var(--soft)]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : null}
              </div>
              <div className="space-y-2 p-4">
                <p className="line-clamp-2 text-sm font-semibold text-[color:var(--ink)]">{item.title}</p>
                {publishedAt ? <p className="text-xs text-[color:var(--muted)]">{publishedAt}</p> : null}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
