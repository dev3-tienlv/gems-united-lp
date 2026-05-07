import type { BlogItem, CareerItem, DesignItem } from "@/types/landing";

export const careers: CareerItem[] = [
  { id: "digital-marketing-executive", title: "Digital Marketing Executive", location: "Da Nang", type: "Full-time" },
  { id: "designer-pod", title: "Designer POD", location: "Da Nang", type: "Full-time" },
  { id: "customer-service", title: "Customer Service", location: "Da Nang", type: "Full-time" },
  { id: "data-analyst", title: "Data Analyst", location: "Da Nang", type: "Full-time" },
  { id: "idea-executive", title: "Idea Executive", location: "Da Nang", type: "Full-time" },
  { id: "designer-support", title: "Designer Support", location: "Da Nang", type: "Full-time" },
];

export const blogItems: BlogItem[] = [
  {
    title: "How We Build POD Campaigns For Global Audiences",
    excerpt: "From concept to fulfillment, our process keeps quality high and iteration fast.",
    slug: "how-we-build-pod-campaigns",
  },
  {
    title: "Scaling Creative Operations With Better Systems",
    excerpt: "A practical playbook for reducing bottlenecks in creative production teams.",
    slug: "scaling-creative-operations",
  },
  {
    title: "What Great B2B Partnerships Look Like In POD",
    excerpt: "The standards, cadence, and communication model that drive long-term growth.",
    slug: "great-b2b-partnerships-in-pod",
  },
];

export const designItems: DesignItem[] = [
  { id: "design-01", title: "Wellness POD Collection", category: "Apparel" },
  { id: "design-02", title: "Holiday Gift Capsule", category: "Campaign" },
  { id: "design-03", title: "Streetwear Merch Bundle", category: "Lifestyle" },
  { id: "design-04", title: "Creator Brand Launch", category: "Branding" },
  { id: "design-05", title: "Fitness Product Visuals", category: "Creative" },
  { id: "design-06", title: "Global Market Variant Set", category: "Localization" },
];

export const LOGO_URL = "/logo-main.png";
