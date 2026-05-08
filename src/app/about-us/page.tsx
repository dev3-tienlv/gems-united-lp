import type { Metadata } from "next";

export const revalidate = 3600;

import { AboutHero } from "@/components/about/AboutHero";
import { CapabilityPillars } from "@/components/about/CapabilityPillars";
import { GemsterCulture } from "@/components/about/GemsterCulture";
import { OriginStory } from "@/components/about/OriginStory";
import { PodPipeline } from "@/components/about/PodPipeline";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { DualCta } from "@/components/landing/DualCta";
import { MetricsBand } from "@/components/landing/MetricsBand";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { ValueCard } from "@/components/landing/cards";
import { Reveal } from "@/components/motion/Reveal";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";

export const metadata: Metadata = {
  title: "About GEMS United",
  description:
    "Shaping the future of B2B POD from Vietnam to the world with creative intelligence, end-to-end operations, and Gemster culture.",
  alternates: {
    canonical: "/about-us",
  },
  openGraph: {
    title: "About GEMS United",
    description:
      "A Da Nang-born B2B POD team with global ambition: trust signals, operating pipeline, culture, and partnership opportunities.",
    images: ["/mission-3d.png"],
  },
};

export default async function AboutUsPage() {
  const locale = await getLocale();
  const text = getMessages(locale);
  return (
    <div className="bg-gradient-to-br from-[color:var(--about-hero-from)] via-[color:var(--hero-via)] to-[color:var(--about-hero-to)]">
      <Header locale={locale} />
      <main id="main-content">
        <AboutHero locale={locale} />
        <MetricsBand metrics={text.about.metrics} />
        <OriginStory locale={locale} />
        <CapabilityPillars locale={locale} />
        <PodPipeline locale={locale} />
        <section className="py-20 md:py-24">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.about.values.eyebrow}
                title={text.about.values.title}
                description={text.about.values.description}
                maxWidth="5xl"
                titleClassName="md:whitespace-nowrap md:text-[2rem]"
              />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {text.home.values.map((value, index) => (
                <Reveal key={value.shortCode} delay={index * 0.04}>
                  <ValueCard item={value} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        <GemsterCulture locale={locale} />
        <DualCta locale={locale} />
      </main>
      <Footer locale={locale} showTopBanner={false} />
    </div>
  );
}
