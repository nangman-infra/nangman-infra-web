import { getFallbackBlogPosts } from "@/data/blogPosts";
import { getLatestBlogPostsUseCase } from "@/lib/application/use-cases/blog/get-latest-blog-posts";
import { getLatestAnnouncementsUseCase } from "@/lib/application/use-cases/announcements/get-latest-announcements";
import { fetchBackendJson } from "@/lib/application/server/fetch-backend-json";
import { setRequestLocale } from "next-intl/server";
import HomeClient from "@/app/HomeClient";

export const dynamic = "force-dynamic";

const HOME_FEED_REVALIDATE_SECONDS = 300;
const BLOG_BACKEND_PATH = "/api/v1/blog/posts";
const ANNOUNCEMENTS_BACKEND_PATH = "/api/v1/notices";

// Server Component
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [latestPosts, latestAnnouncements] = await Promise.all([
    getLatestBlogPostsUseCase({
      count: 4,
      fallback: getFallbackBlogPosts(4),
      fetcher: () =>
        fetchBackendJson({
          backendPath: BLOG_BACKEND_PATH,
          revalidate: HOME_FEED_REVALIDATE_SECONDS,
        }),
    }),
    getLatestAnnouncementsUseCase({
      count: 3,
      fetcher: () =>
        fetchBackendJson({
          backendPath: ANNOUNCEMENTS_BACKEND_PATH,
          revalidate: HOME_FEED_REVALIDATE_SECONDS,
        }),
    }),
  ]);

  return (
    <HomeClient
      latestPosts={latestPosts}
      latestAnnouncements={latestAnnouncements}
    />
  );
}
