import {
  CONTACT_EMAIL,
  FACEBOOK_URL,
  ORG_ADDRESS,
  ORG_DESCRIPTION,
  ORG_LEGAL_NAME,
  ORG_NAME,
  SITE_URL,
} from "@/lib/constants";
import { resolveCareerFields } from "@/lib/career-locale";
import { employmentTypeForSchema } from "@/lib/employment-type";
import type { BlogItem, CareerItem } from "@/types/landing";
import type { Locale } from "@/i18n/types";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    legalName: ORG_LEGAL_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/favicon-gems.png"),
    description: ORG_DESCRIPTION,
    email: CONTACT_EMAIL,
    sameAs: [FACEBOOK_URL],
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG_ADDRESS.streetAddress,
      addressLocality: ORG_ADDRESS.addressLocality,
      addressCountry: ORG_ADDRESS.addressCountry,
      postalCode: ORG_ADDRESS.postalCode,
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: SITE_URL,
    inLanguage: ["vi", "en"],
  };
}

export function jobPostingJsonLd(career: CareerItem, locale: Locale) {
  const fields = resolveCareerFields(career, locale);
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: career.title,
    description:
      fields.summary ||
      fields.responsibilities ||
      `${career.title} at ${ORG_NAME}.`,
    datePosted: new Date().toISOString().slice(0, 10),
    employmentType: employmentTypeForSchema(career.type),
    hiringOrganization: {
      "@type": "Organization",
      name: ORG_NAME,
      sameAs: SITE_URL,
      logo: absoluteUrl("/favicon-gems.png"),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: fields.location || ORG_ADDRESS.addressLocality,
        addressCountry: ORG_ADDRESS.addressCountry,
      },
    },
    inLanguage: locale,
    directApply: Boolean(career.applyUrl),
    url: absoluteUrl(`/careers/${career.slug || career.id}`),
  };
}

export function blogPostingJsonLd(blog: BlogItem, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    inLanguage: locale,
    image: blog.imageUrl ? [blog.imageUrl] : undefined,
    datePublished: blog.publishedAt,
    author: {
      "@type": "Organization",
      name: ORG_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon-gems.png"),
      },
    },
    mainEntityOfPage: blog.slug ? absoluteUrl(`/blog/${blog.slug}`) : undefined,
  };
}
