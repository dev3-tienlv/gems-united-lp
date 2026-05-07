import type { Metadata } from "next";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Offers } from "@/components/landing/Offers";
import { BrandPhilosophy } from "@/components/landing/BrandPhilosophy";
import { OurDesigns } from "@/components/landing/OurDesigns";
import { ContactSection } from "@/components/landing/ContactSection";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { BlogCard, CareerCard, ValueCard } from "@/components/landing/cards";
import { Reveal } from "@/components/motion/Reveal";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import { getLandingContent } from "@/lib/wix-headless";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function Home() {
  const [content, locale] = await Promise.all([getLandingContent(), getLocale()]);
  const text = getMessages(locale);

  return (
    <div className="bg-gradient-to-br from-[color:var(--hero-from)] via-[color:var(--hero-via)] to-[color:var(--hero-to)]">
      <Header locale={locale} />
      <main id="main-content">
        <Hero locale={locale} />

        <Offers locale={locale} />

        <section id="values" className="bg-[color:var(--surface)] py-20 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.home.valuesEyebrow}
                title={text.home.valuesTitle}
                description={text.home.valuesDescription}
              />
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {text.home.values.map((item, index) => (
                <Reveal key={`${item.shortCode}-${index}`} delay={(index % 4) * 0.05}>
                  <ValueCard item={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <BrandPhilosophy locale={locale} />

        <OurDesigns items={content.designs} locale={locale} />

        <section id="careers" className="bg-[color:var(--surface)] py-20 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.home.careersEyebrow}
                title={text.home.careersTitle}
                description={text.home.careersDescription}
              />
            </Reveal>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {content.careers.map((career, index) => (
                <Reveal key={`${career.id}-${index}`} delay={(index % 3) * 0.05}>
                  <CareerCard item={career} locale={locale} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="insights" className="bg-[color:var(--soft)] py-20 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.home.blogsEyebrow}
                title={text.home.blogsTitle}
                description={text.home.blogsDescription}
              />
            </Reveal>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {content.blogs.map((blog, index) => (
                <Reveal key={`${blog.slug || blog.title}-${index}`}>
                  <BlogCard item={blog} locale={locale} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <ContactSection locale={locale} sectionClassName="bg-[color:var(--surface)] pb-40 pt-20 md:pb-40 md:pt-28" />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
