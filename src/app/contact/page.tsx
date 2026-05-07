import type { Metadata } from "next";

export const revalidate = 3600;

import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { getLocale } from "@/i18n/locale";

export const metadata: Metadata = {
  title: "Contact GEMS United",
  description:
    "Get in touch with the GEMS United team in Da Nang for B2B POD, creative, and operations engagements.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const locale = await getLocale();
  return (
    <div className="bg-[color:var(--bg)]">
      <Header locale={locale} initialSolid />
      <main id="main-content">
        <ContactSection locale={locale} sectionClassName="bg-[color:var(--surface)] pb-40 pt-20 md:pb-40 md:pt-28" />
      </main>
      <Footer locale={locale} showTopBanner={false} />
    </div>
  );
}
