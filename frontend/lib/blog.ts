import type { BlogPost } from "@/lib/domain/blog";

export function getBlogPostSourceUrl(
  post: Pick<BlogPost, "link" | "url">,
): string {
  return post.link || post.url || "#";
}
