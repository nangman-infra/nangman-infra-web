import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { incidentReports } from "@/data/incidentReports";
import { routing } from "@/i18n/routing";

describe("app/sitemap", () => {
  it("includes the default root entry", () => {
    const entries = sitemap();
    expect(entries[0]).toMatchObject({
      url: "https://nangman.cloud",
      changeFrequency: "weekly",
      priority: 0.4,
    });
  });

  it("includes localized static pages with alternates", () => {
    const entries = sitemap();
    const aboutKo = entries.find(
      (entry) => entry.url === "https://nangman.cloud/ko/about",
    );
    const aboutEn = entries.find(
      (entry) => entry.url === "https://nangman.cloud/en/about",
    );

    expect(aboutKo).toMatchObject({
      changeFrequency: "monthly",
      priority: 0.8,
      alternates: {
        languages: {
          ko: "https://nangman.cloud/ko/about",
          en: "https://nangman.cloud/en/about",
        },
      },
    });
    expect(aboutEn).toBeDefined();
  });

  it("gives monitoring pages hourly frequency and projects higher priority", () => {
    const entries = sitemap();
    const monitoring = entries.find(
      (entry) => entry.url === "https://nangman.cloud/ko/monitoring",
    );
    const projects = entries.find(
      (entry) => entry.url === "https://nangman.cloud/en/projects",
    );

    expect(monitoring?.changeFrequency).toBe("hourly");
    expect(projects?.priority).toBe(0.9);
  });

  it("includes incident detail pages for every locale", () => {
    const entries = sitemap();
    const incidentEntryCount = entries.filter((entry) =>
      /\/(ko|en)\/incidents\//.test(entry.url),
    ).length;

    expect(incidentEntryCount).toBe(
      incidentReports.length * routing.locales.length,
    );
  });
});
