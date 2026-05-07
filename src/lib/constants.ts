export const DEFAULT_WIX_SITE_ID = "b97a67bb-8f38-442d-8e50-69d29744f34c";

export const CONTACT_EMAIL = "hr@gemsunited.com";
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

export const FACEBOOK_URL = "https://facebook.com/gemsutd";
export const ALMA_GEMS_BESTSELLERS_URL =
  "https://almagems.com/collections/best-sellers";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://www.gemsunited.com";

export const ORG_NAME = "GEMS United";
export const ORG_LEGAL_NAME = "GEMS United";
export const ORG_DESCRIPTION =
  "B2B POD partner delivering creative, operations, and software capabilities to global teams from Da Nang, Vietnam.";
export const ORG_ADDRESS = {
  streetAddress: "134 Duong 30 Thang 04, Hoa Cuong Ward",
  addressLocality: "Da Nang",
  addressCountry: "VN",
  postalCode: "550000",
};

export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export const DEFAULT_LOCALE = "vi" as const;
