import type { BlogPost } from "@/lib/domain/blog";

function slugifySegment(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function hashString(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

export function getBlogPostSourceUrl(
  post: Pick<BlogPost, "link" | "url">,
): string {
  return post.link || post.url || "#";
}

export function getBlogPostInternalSlug(
  post: Pick<BlogPost, "title" | "author" | "date" | "link" | "url">,
): string {
  const sourceUrl = getBlogPostSourceUrl(post);
  const titlePart = slugifySegment(post.title).slice(0, 72) || "post";
  const authorPart = slugifySegment(post.author) || "author";
  const timestamp = Date.parse(post.date);
  const datePart = Number.isNaN(timestamp)
    ? "undated"
    : new Date(timestamp).toISOString().slice(0, 10).replace(/-/g, "");
  const urlHash = hashString(sourceUrl);

  return `${authorPart}-${datePart}-${titlePart}-${urlHash}`;
}

export function getBlogPostInternalHref(
  post: Pick<BlogPost, "title" | "author" | "date" | "link" | "url">,
): string {
  return `/blog/${getBlogPostInternalSlug(post)}`;
}

export function matchesBlogPostSlug(
  post: Pick<BlogPost, "title" | "author" | "date" | "link" | "url">,
  slug: string,
): boolean {
  return getBlogPostInternalSlug(post) === slug;
}
