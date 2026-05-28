import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlogPost } from '@/lib/domain/blog';
import { fetchBlogPostsApi } from '@/lib/infrastructure/http/blog-api-client';
import { getLatestBlogPostsUseCase } from './get-latest-blog-posts';

vi.mock('@/lib/infrastructure/http/blog-api-client', () => ({
  fetchBlogPostsApi: vi.fn(),
}));

const mockedFetchBlogPostsApi = vi.mocked(fetchBlogPostsApi);

const fallbackPosts: BlogPost[] = [
  {
    title: 'fallback',
    description: 'fallback description',
    link: 'https://example.com/fallback',
    date: '2026-01-01',
    author: 'fallback-author',
    platform: 'other',
    tags: ['fallback'],
  },
];

describe('getLatestBlogPostsUseCase', () => {
  beforeEach(() => {
    mockedFetchBlogPostsApi.mockReset();
  });

  it('returns fallback when payload has no valid posts', async () => {
    mockedFetchBlogPostsApi.mockResolvedValue({
      data: { posts: [{ invalid: true }], total: 0, page: 1, pageSize: 1, totalPages: 0 },
    });

    const result = await getLatestBlogPostsUseCase({
      count: 1,
      fallback: fallbackPosts,
    });

    expect(result).toEqual(fallbackPosts);
  });

  it('returns parsed posts from the paginated response', async () => {
    mockedFetchBlogPostsApi.mockResolvedValue({
      data: {
        posts: [
          {
            title: 'post',
            description: 'desc',
            link: 'https://example.com/post',
            date: '2026-01-01',
            author: '이성원',
            authorImage: '/profiles/seongwon.png',
            platform: 'tistory',
            tags: ['infra'],
          },
        ],
        total: 1,
        page: 1,
        pageSize: 1,
        totalPages: 1,
      },
    });

    const result = await getLatestBlogPostsUseCase({
      count: 1,
      fallback: fallbackPosts,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: 'post',
      link: 'https://example.com/post',
    });
  });
});
