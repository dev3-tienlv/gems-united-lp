import type { Metadata } from "next";
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
      <Header locale={locale} />
      <main id="main-content">
        <ContactSection locale={locale} />
      </main>
      <Footer locale={locale} />
    </div>
  );
}
