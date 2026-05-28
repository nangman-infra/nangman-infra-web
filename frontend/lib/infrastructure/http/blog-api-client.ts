import { getApiJson } from '@/lib/infrastructure/http/json-api-client';

const BLOG_POSTS_PATH = '/blog/posts';
const BLOG_AUTHORS_PATH = '/blog/authors';
const BLOG_ERROR_MESSAGE = '블로그 포스트를 가져오는데 실패했습니다.';
const AUTHORS_ERROR_MESSAGE = '작성자 목록을 가져오는데 실패했습니다.';

export type BlogSortOption = 'latest' | 'oldest' | 'author';

export interface FetchBlogPostsApiOptions {
  page?: number;
  pageSize?: number;
  author?: string;
  search?: string;
  sort?: BlogSortOption;
}

export async function fetchBlogPostsApi(
  options: FetchBlogPostsApiOptions = {},
): Promise<unknown> {
  const params = new URLSearchParams();
  if (typeof options.page === 'number' && options.page > 0) {
    params.set('page', String(options.page));
  }
  if (typeof options.pageSize === 'number' && options.pageSize > 0) {
    params.set('pageSize', String(options.pageSize));
  }
  if (typeof options.author === 'string' && options.author.length > 0) {
    params.set('author', options.author);
  }
  if (typeof options.search === 'string' && options.search.length > 0) {
    params.set('search', options.search);
  }
  if (typeof options.sort === 'string') {
    params.set('sort', options.sort);
  }
  const query = params.toString();
  const path =
    query.length > 0 ? `${BLOG_POSTS_PATH}?${query}` : BLOG_POSTS_PATH;

  return getApiJson<unknown>(path, BLOG_ERROR_MESSAGE, {
    cache: 'no-store',
  });
}

export async function fetchBlogAuthorsApi(): Promise<unknown> {
  return getApiJson<unknown>(BLOG_AUTHORS_PATH, AUTHORS_ERROR_MESSAGE, {
    cache: 'no-store',
  });
}
