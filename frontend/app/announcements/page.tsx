import { getLatestAnnouncementsUseCase } from "@/lib/application/use-cases/announcements/get-latest-announcements";
import { fetchBackendJson } from "@/lib/application/server/fetch-backend-json";
import AnnouncementsClient from "./AnnouncementsClient";

const ANNOUNCEMENTS_REVALIDATE_SECONDS = 300;
const ANNOUNCEMENTS_BACKEND_PATH = "/api/v1/notices";

export default async function AnnouncementsPage() {
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
    name: "Nangman Infra 공지사항",
    url: "https://nangman.cloud/announcements",
    description: "낭만 인프라의 운영 공지와 서비스 업데이트 목록입니다.",
    inLanguage: "ko-KR",
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
