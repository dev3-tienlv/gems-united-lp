export interface ValueItem {
  title: string;
  shortCode: string;
  description: string;
}

export interface CareerLocalizedFields {
  responsibilities?: string;
  requirements?: string;
  growthPath?: string;
  benefits?: string;
  location?: string;
  workSchedule?: string;
}

export interface CareerItem {
  id: string;
  slug: string;
  title: string;
  location: string;
  type: string;
  summary?: string;
  responsibilities?: string;
  requirements?: string;
  growthPath?: string;
  benefits?: string;
  workSchedule?: string;
  imageUrl?: string;
  applyUrl?: string;
  en?: CareerLocalizedFields;
}

export interface BlogItem {
  title: string;
  excerpt: string;
  slug?: string;
  imageUrl?: string;
  category?: string;
  author?: string;
  body?: string;
  bodyHtml?: string;
  publishedAt?: string;
  permalink?: string;
  postPageUrl?: string;
}

export interface DesignItem {
  id: string;
  title: string;
  imageUrl?: string;
  category?: string;
  href?: string;
}
