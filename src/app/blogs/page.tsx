import type { Metadata } from "next";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { BlogCard } from "@/components/landing/cards";
import { Reveal } from "@/components/motion/Reveal";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import { getAllBlogs } from "@/lib/wix-headless";

export const metadata: Metadata = {
  title: "Blog & Insights",
  description:
    "Notes from the GEMS United operations, growth, and culture teams on running B2B POD and creative engines.",
  alternates: {
    canonical: "/blogs",
  },
};

export default async function BlogsPage() {
  const [blogs, locale] = await Promise.all([getAllBlogs(), getLocale()]);
  const text = getMessages(locale);

  return (
    <div className="bg-[color:var(--bg)]">
      <Header locale={locale} initialSolid />
      <main id="main-content">
        <section className="bg-[color:var(--surface)] pb-40 pt-20 md:pb-40 md:pt-28">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.common.fromBlog}
                title={text.common.allUpdates}
                description={text.common.allUpdatesDesc}
              />
            </Reveal>

            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog, index) => (
                <Reveal key={`${blog.slug || blog.title}-${index}`} delay={(index % 3) * 0.05}>
                  <BlogCard item={blog} locale={locale} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
