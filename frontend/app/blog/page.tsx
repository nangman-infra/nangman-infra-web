import { getFallbackBlogPosts } from "@/data/blogPosts";
import { getLatestBlogPostsUseCase } from "@/lib/application/use-cases/blog/get-latest-blog-posts";
import { fetchBackendJson } from "@/lib/application/server/fetch-backend-json";
import BlogListClient from "./BlogListClient";

const BLOG_LIST_REVALIDATE_SECONDS = 300;
const BLOG_BACKEND_PATH = "/api/v1/blog/posts";

export default async function BlogPage() {
  const posts = await getLatestBlogPostsUseCase({
    count: 20,
    fallback: getFallbackBlogPosts(20),
    fetcher: () =>
      fetchBackendJson({
        backendPath: BLOG_BACKEND_PATH,
        revalidate: BLOG_LIST_REVALIDATE_SECONDS,
      }),
  });

  return <BlogListClient posts={posts} />;
}
