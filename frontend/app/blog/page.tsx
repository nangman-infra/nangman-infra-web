import { getLatestBlogPosts } from "@/data/blogPosts";
import BlogListClient from "./BlogListClient";

export default async function BlogPage() {
  // Fetch more posts for the main blog list page
  const posts = await getLatestBlogPosts(20);

  return <BlogListClient posts={posts} />;
}
