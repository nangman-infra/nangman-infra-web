import { getFallbackBlogPosts } from "@/data/blogPosts";
import BlogListClient from "./BlogListClient";

export default function BlogPage() {
  const posts = getFallbackBlogPosts(20);

  return <BlogListClient posts={posts} />;
}
