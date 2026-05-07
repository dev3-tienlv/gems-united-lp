import type { Metadata } from "next";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { SectionTitle } from "@/components/landing/SectionTitle";
import { CareerCard } from "@/components/landing/cards";
import { Reveal } from "@/components/motion/Reveal";
import { getLocale } from "@/i18n/locale";
import { getMessages } from "@/i18n/messages";
import { getAllCareers } from "@/lib/wix-headless";

export const metadata: Metadata = {
  title: "Careers at GEMS United",
  description:
    "Open roles in operations, marketing, design, and growth at GEMS United Da Nang.",
  alternates: {
    canonical: "/careers",
  },
};

export default async function CareersPage() {
  const [careers, locale] = await Promise.all([getAllCareers(), getLocale()]);
  const text = getMessages(locale);

  return (
    <div className="bg-[color:var(--bg)]">
      <Header locale={locale} />
      <main id="main-content">
        <section className="bg-[color:var(--soft)] py-20 md:py-28">
          <div className="mx-auto w-full max-w-7xl px-5 md:px-8">
            <Reveal>
              <SectionTitle
                eyebrow={text.common.careersEyebrow}
                title={text.common.careersTitle}
                description={text.common.careersDesc}
              />
            </Reveal>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {careers.map((career, index) => (
                <Reveal key={`${career.id}-${index}`} delay={(index % 3) * 0.05}>
                  <CareerCard item={career} locale={locale} />
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
