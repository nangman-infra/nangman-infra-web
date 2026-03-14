import { MetadataRoute } from "next";
import { incidentReports } from "@/data/incidentReports";
import { getPublicBlogPosts } from "@/lib/application/use-cases/blog/get-public-blog-posts";
import { getBlogPostInternalHref } from "@/lib/blog";

const DEFAULT_LAST_MODIFIED = new Date("2026-03-14T00:00:00.000Z");

function resolveLastModified(value: string): Date {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return DEFAULT_LAST_MODIFIED;
  }

  return new Date(timestamp);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://nangman.cloud";
  const blogPosts = await getPublicBlogPosts(50);
  const incidentEntries: MetadataRoute.Sitemap = incidentReports.map(
    (report) => ({
      url: `${baseUrl}/incidents/${report.slug}`,
      lastModified: new Date(report.resolvedAtIso),
      changeFrequency: "yearly",
      priority: 0.6,
    }),
  );
  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}${getBlogPostInternalHref(post)}`,
    lastModified: resolveLastModified(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/monitoring`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/incidents`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/members`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/announcements`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...blogEntries,
    ...incidentEntries,
  ];
}
