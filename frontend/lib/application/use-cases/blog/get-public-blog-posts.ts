import { getFallbackBlogPosts } from "@/data/blogPosts";
import type { BlogPost } from "@/lib/domain/blog";
import { fetchBackendJson } from "@/lib/application/server/fetch-backend-json";
import { getLatestBlogPostsUseCase } from "./get-latest-blog-posts";

const BLOG_REVALIDATE_SECONDS = 300;
const BLOG_BACKEND_PATH = "/api/v1/blog/posts";

export async function getPublicBlogPosts(
  count: number = 50,
): Promise<BlogPost[]> {
  return getLatestBlogPostsUseCase({
    count,
    fallback: getFallbackBlogPosts(count),
    fetcher: () =>
      fetchBackendJson({
        backendPath: BLOG_BACKEND_PATH,
        revalidate: BLOG_REVALIDATE_SECONDS,
      }),
  });
}
