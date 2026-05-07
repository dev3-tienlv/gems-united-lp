import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { AuroraCursor } from "@/components/effects/AuroraCursor";
import { WixInboxChatWidget } from "@/components/landing/WixInboxChatWidget";
import { JsonLd } from "@/components/seo/JsonLd";
import { ORG_DESCRIPTION, ORG_NAME, SITE_URL } from "@/lib/constants";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { themeBlockingScript } from "@/lib/theme-script";
import { getLocale } from "@/i18n/locale";
import "./globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--ff-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const display = Be_Vietnam_Pro({
  variable: "--ff-display",
  subsets: ["latin", "vietnamese"],
  weight: ["700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: ORG_NAME,
  title: {
    default: `${ORG_NAME} — B2B POD Partner`,
    template: `%s | ${ORG_NAME}`,
  },
  description: ORG_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: ORG_NAME,
    title: `${ORG_NAME} — B2B POD Partner`,
    description: ORG_DESCRIPTION,
    url: "/",
    locale: "vi_VN",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${ORG_NAME} — B2B POD Partner`,
    description: ORG_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${sans.variable} ${display.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBlockingScript }} />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="min-h-full bg-[color:var(--bg)] text-[color:var(--fg)] font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-[color:var(--brand)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        {children}
        <WixInboxChatWidget />
        <AuroraCursor />
      </body>
    </html>
  );
}
