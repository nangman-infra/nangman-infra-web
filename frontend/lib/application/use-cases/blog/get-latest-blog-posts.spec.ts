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

  it('returns fallback when payload is parseable but empty', async () => {
    mockedFetchBlogPostsApi.mockResolvedValue({
      data: [{ invalid: true }],
    });

    const result = await getLatestBlogPostsUseCase({
      count: 1,
      fallback: fallbackPosts,
    });

    expect(result).toEqual(fallbackPosts);
  });

  it('returns parsed posts when payload is valid', async () => {
    mockedFetchBlogPostsApi.mockResolvedValue({
      data: [
        {
          title: 'post',
          description: 'desc',
          link: 'https://example.com/post',
          date: '2026-01-01',
          author: 'author',
          authorImage: 'https://example.com/profile.png',
          platform: 'tistory',
          tags: ['infra'],
        },
      ],
    });

    const result = await getLatestBlogPostsUseCase({
      count: 1,
      fallback: fallbackPosts,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: 'post',
      link: 'https://example.com/post',
      id: 'https://example.com/post',
      slug: 'https://example.com/post',
      url: 'https://example.com/post',
    });
  });
});
