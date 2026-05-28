import type { BlogPost } from "@/data/blogPosts";
import { getIntlLocale } from "@/lib/i18n";

export const PAGE_WINDOW = 5;

export interface BlogPostsPage {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface PageResponseShape {
  data?: {
    posts?: unknown;
    total?: unknown;
    page?: unknown;
    pageSize?: unknown;
    totalPages?: unknown;
  };
}

interface AuthorsResponseShape {
  data?: {
    authors?: unknown;
  };
}

export function formatDate(dateText: string, locale: string): string {
  const timestamp = Date.parse(dateText);
  if (Number.isNaN(timestamp)) {
    return dateText;
  }
  return new Intl.DateTimeFormat(getIntlLocale(locale === "ko" ? "ko" : "en"), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function buildPageWindow(
  currentPage: number,
  totalPages: number,
): number[] {
  if (totalPages <= 0) {
    return [];
  }
  if (totalPages <= PAGE_WINDOW) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const half = Math.floor(PAGE_WINDOW / 2);
  let start = Math.max(1, currentPage - half);
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
  start = Math.max(1, end - PAGE_WINDOW + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function extractPage(
  payload: unknown,
  fallbackPageSize: number,
): BlogPostsPage {
  if (!payload || typeof payload !== "object") {
    return {
      posts: [],
      total: 0,
      page: 1,
      pageSize: fallbackPageSize,
      totalPages: 0,
    };
  }
  const data = (payload as PageResponseShape).data;
  if (!data || typeof data !== "object") {
    return {
      posts: [],
      total: 0,
      page: 1,
      pageSize: fallbackPageSize,
      totalPages: 0,
    };
  }
  const posts = Array.isArray(data.posts) ? (data.posts as BlogPost[]) : [];
  const total = typeof data.total === "number" ? data.total : posts.length;
  const page = typeof data.page === "number" ? data.page : 1;
  const pageSize =
    typeof data.pageSize === "number" ? data.pageSize : fallbackPageSize;
  const totalPages = resolveTotalPages(data.totalPages, total, pageSize);
  return { posts, total, page, pageSize, totalPages };
}

function resolveTotalPages(
  rawTotalPages: unknown,
  total: number,
  pageSize: number,
): number {
  if (typeof rawTotalPages === "number") {
    return rawTotalPages;
  }
  if (pageSize > 0) {
    return Math.ceil(total / pageSize);
  }
  return 0;
}

export function extractAuthors(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") {
    return [];
  }
  const data = (payload as AuthorsResponseShape).data;
  if (!data || typeof data !== "object") {
    return [];
  }
  const authors = data.authors;
  if (!Array.isArray(authors)) {
    return [];
  }
  return authors.filter((value): value is string => typeof value === "string");
}
