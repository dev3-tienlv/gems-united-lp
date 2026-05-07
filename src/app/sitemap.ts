import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllBlogs, getAllCareers } from "@/lib/wix-headless";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "/", priority: 1, changeFrequency: "weekly" as const },
    { path: "/about-us", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/blogs", priority: 0.7, changeFrequency: "weekly" as const },
    { path: "/careers", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "yearly" as const },
  ];

  const [blogs, careers] = await Promise.all([getAllBlogs(), getAllCareers()]);
  const now = new Date();

  const blogEntries = blogs
    .filter((blog) => Boolean(blog.slug))
    .map((blog) => ({
      url: `${SITE_URL}/blog/${blog.slug}`,
      lastModified: blog.publishedAt ? new Date(blog.publishedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const careerEntries = careers.map((career) => ({
    url: `${SITE_URL}/careers/${career.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...blogEntries,
    ...careerEntries,
  ];
}
