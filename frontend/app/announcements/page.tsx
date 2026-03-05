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

  return <AnnouncementsClient announcements={announcements} />;
}
