import { describe, expect, it } from 'vitest';
import type { BlogPost } from '@/lib/domain/blog';
import { getBlogPostsPageUseCase } from './get-blog-posts-page';

const fallback: BlogPost[] = [
  {
    title: 'fallback',
    description: 'fallback description',
    link: 'https://example.com/fallback',
    date: '2026-01-01',
    author: 'fallback-author',
    platform: 'other',
    tags: [],
  },
];

describe('getBlogPostsPageUseCase', () => {
  it('parses a valid paginated response', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 2,
      pageSize: 10,
      fallback,
      fetcher: async () => ({
        data: {
          posts: [
            {
              title: 'post',
              description: 'desc',
              link: 'https://example.com/post',
              date: '2026-05-01',
              author: '이성원',
              platform: 'tistory',
              tags: ['k8s'],
            },
          ],
          total: 47,
          page: 2,
          pageSize: 10,
          totalPages: 5,
        },
      }),
    });

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].title).toBe('post');
    expect(result.total).toBe(47);
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(5);
  });

  it('drops malformed posts and uses fallback when none valid', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 1,
      pageSize: 10,
      fallback,
      fetcher: async () => ({
        data: { posts: [{ invalid: true }], total: 0 },
      }),
    });

    expect(result.posts).toEqual(fallback);
    expect(result.total).toBe(fallback.length);
  });

  it('returns fallback when fetcher throws', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 1,
      pageSize: 10,
      fallback,
      fetcher: async () => {
        throw new Error('network');
      },
    });

    expect(result.posts).toEqual(fallback);
  });

  it('returns fallback when payload is not an object', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 1,
      pageSize: 10,
      fallback,
      fetcher: async () => 'not an object',
    });

    expect(result.posts).toEqual(fallback);
  });

  it('falls back to fallback when data.posts is missing', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 1,
      pageSize: 10,
      fallback,
      fetcher: async () => ({ data: { total: 0 } }),
    });

    expect(result.posts).toEqual(fallback);
  });

  it('derives totalPages when not provided by the server', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 1,
      pageSize: 10,
      fallback,
      fetcher: async () => ({
        data: {
          posts: [
            {
              title: 'a',
              description: 'd',
              link: 'https://example.com/a',
              date: '2026-05-01',
              author: '이성원',
              platform: 'tistory',
              tags: [],
            },
          ],
          total: 23,
          page: 1,
          pageSize: 10,
          // totalPages omitted
        },
      }),
    });

    expect(result.totalPages).toBe(3);
  });

  it('coerces invalid pageSize/page from server back to input values', async () => {
    const result = await getBlogPostsPageUseCase({
      page: 3,
      pageSize: 20,
      fallback,
      fetcher: async () => ({
        data: {
          posts: [
            {
              title: 'a',
              description: 'd',
              link: 'https://example.com/a',
              date: '2026-05-01',
              author: '이성원',
              platform: 'tistory',
              tags: [],
            },
          ],
          total: 100,
          page: -1, // invalid
          pageSize: 0, // invalid
        },
      }),
    });

    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(20);
  });
});
