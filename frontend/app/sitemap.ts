import { MetadataRoute } from "next";
import { incidentReports } from "@/data/incidentReports";
import { routing } from "@/i18n/routing";

const DEFAULT_LAST_MODIFIED = new Date("2026-03-14T00:00:00.000Z");
const BASE_URL = "https://nangman.cloud";
const LOCALIZED_PAGES = [
  "",
  "/about",
  "/services",
  "/monitoring",
  "/incidents",
  "/members",
  "/projects",
  "/blog",
  "/announcements",
  "/contact",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LOCALIZED_PAGES.map((pathname) => ({
      url: `${BASE_URL}/${locale}${pathname}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: pathname === "/monitoring" ? "hourly" : pathname === "" ? "weekly" : "monthly",
      priority: pathname === "" ? 1 : pathname === "/services" || pathname === "/projects" ? 0.9 : 0.8,
      alternates: {
        languages: {
          ko: `${BASE_URL}/ko${pathname}`,
          en: `${BASE_URL}/en${pathname}`,
        },
      },
    })),
  );
  const incidentEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    incidentReports.map((report) => ({
      url: `${BASE_URL}/${locale}/incidents/${report.slug}`,
      lastModified: new Date(report.resolvedAtIso),
      changeFrequency: "yearly",
      priority: 0.6,
      alternates: {
        languages: {
          ko: `${BASE_URL}/ko/incidents/${report.slug}`,
          en: `${BASE_URL}/en/incidents/${report.slug}`,
        },
      },
    })),
  );

  return [
    {
      url: BASE_URL,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.4,
    },
    ...pageEntries,
    ...incidentEntries,
  ];
}
