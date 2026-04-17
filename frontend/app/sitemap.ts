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

function getChangeFrequency(
  pathname: (typeof LOCALIZED_PAGES)[number],
): "hourly" | "weekly" | "monthly" {
  if (pathname === "/monitoring") {
    return "hourly";
  }

  if (pathname === "") {
    return "weekly";
  }

  return "monthly";
}

function getPagePriority(pathname: (typeof LOCALIZED_PAGES)[number]): number {
  if (pathname === "") {
    return 1;
  }

  if (pathname === "/services" || pathname === "/projects") {
    return 0.9;
  }

  return 0.8;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries: MetadataRoute.Sitemap = routing.locales.flatMap((locale) =>
    LOCALIZED_PAGES.map((pathname) => ({
      url: `${BASE_URL}/${locale}${pathname}`,
      lastModified: DEFAULT_LAST_MODIFIED,
      changeFrequency: getChangeFrequency(pathname),
      priority: getPagePriority(pathname),
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
