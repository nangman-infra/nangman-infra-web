import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/routing";
import { getLatestAnnouncementsUseCase } from "@/lib/application/use-cases/announcements/get-latest-announcements";
import { fetchBackendJson } from "@/lib/application/server/fetch-backend-json";
import { getLocalizedUrl, getOpenGraphLocale } from "@/lib/i18n";
import AnnouncementsClient from "./AnnouncementsClient";

const ANNOUNCEMENTS_REVALIDATE_SECONDS = 300;
const ANNOUNCEMENTS_BACKEND_PATH = "/api/v1/notices";

type AnnouncementsPageProps = Readonly<{
  params: Promise<{ locale: AppLocale }>;
}>;

export default async function AnnouncementsPage({
  params,
}: AnnouncementsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AnnouncementsPage" });
  const announcements = await getLatestAnnouncementsUseCase({
    fetcher: () =>
      fetchBackendJson({
        backendPath: ANNOUNCEMENTS_BACKEND_PATH,
        revalidate: ANNOUNCEMENTS_REVALIDATE_SECONDS,
      }),
  });

  const announcementCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("schemaName"),
    url: getLocalizedUrl(locale, "/announcements"),
    description: t("schemaDescription"),
    inLanguage: getOpenGraphLocale(locale).replace("_", "-"),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: announcements.map((announcement, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: announcement.title,
        datePublished: announcement.publishedAt,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(announcementCollectionSchema),
        }}
      />
      <AnnouncementsClient announcements={announcements} />
    </>
  );
}
