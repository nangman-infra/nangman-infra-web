import { GetAllBlogPostsUseCase } from './application/use-cases/get-all-blog-posts.use-case';
import { MemberBlogConfig } from './domain/member-blog-config';
import { BlogCachePort } from './domain/ports/blog-cache.port';
import { BlogFeedReaderPort } from './domain/ports/blog-feed-reader.port';
import { BlogSourceProviderPort } from './domain/ports/blog-source-provider.port';
import { BlogPost } from './blog.interface';

describe('GetAllBlogPostsUseCase', () => {
  const mockBlogCache: jest.Mocked<BlogCachePort> = {
    get: jest.fn(),
    set: jest.fn(),
  };
  const mockBlogFeedReader: jest.Mocked<BlogFeedReaderPort> = {
    read: jest.fn(),
  };
  const mockBlogSourceProvider: jest.Mocked<BlogSourceProviderPort> = {
    getSources: jest.fn(),
  };

  let useCase: GetAllBlogPostsUseCase;

  const blogSources: MemberBlogConfig[] = [
    {
      name: 'Juno',
      rssUrl: 'http://se-juno.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/junho.png',
    },
    {
      name: 'Seongwoo',
      rssUrl: 'https://seongw00.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/seongwoo.png',
    },
  ];

  beforeEach(() => {
    mockBlogSourceProvider.getSources.mockReturnValue(blogSources);
    useCase = new GetAllBlogPostsUseCase(
      mockBlogCache,
      mockBlogFeedReader,
      mockBlogSourceProvider,
    );
    jest.clearAllMocks();
  });

  it('should return cached posts when cache exists', async () => {
    const cachedPosts: BlogPost[] = [
      {
        title: 'Cached',
        description: 'Cached description',
        link: 'https://example.com/cached',
        date: '2026-02-01T10:00:00.000Z',
        author: 'Juno',
        authorImage: '/profiles/junho.png',
        platform: 'tistory',
        tags: ['cache'],
      },
    ];
    mockBlogCache.get.mockResolvedValue(cachedPosts);

    const result = await useCase.execute();

    expect(result).toEqual(cachedPosts);
    expect(mockBlogFeedReader.read).not.toHaveBeenCalled();
    expect(mockBlogCache.set).not.toHaveBeenCalled();
  });

  it('should fetch, normalize, sort and cache fresh posts', async () => {
    mockBlogCache.get.mockResolvedValue(undefined);
    mockBlogFeedReader.read.mockImplementation(async (rssUrl: string) => {
      if (rssUrl.includes('se-juno')) {
        return [
          {
            title: '  New Post  ',
            content: '<p>Hello <strong>world</strong></p>',
            link: 'https://example.com/new',
            isoDate: '2026-02-10T10:00:00.000Z',
            categories: [' Infra ', 'Cloud', '', 'Ops', 'Extra'],
          },
        ];
      }

      if (rssUrl.includes('seongw00')) {
        return [
          {
            title: 'Old Post',
            contentSnippet: 'old snippet',
            link: 'https://example.com/old',
            isoDate: '2026-02-01T10:00:00.000Z',
            categories: ['Network'],
          },
          {
            title: 'Invalid without link',
            contentSnippet: 'should be filtered',
          },
        ];
      }

      return [];
    });

    const result = await useCase.execute();

    expect(mockBlogFeedReader.read).toHaveBeenCalledTimes(blogSources.length);
    expect(result).toHaveLength(2);
    expect(result[0].link).toBe('https://example.com/new');
    expect(result[1].link).toBe('https://example.com/old');
    expect(result[0].description).toBe('Hello world');
    expect(result[0].tags).toEqual(['Infra', 'Cloud', 'Ops', 'Extra']);
    expect(mockBlogCache.set).toHaveBeenCalledTimes(1);
    expect(mockBlogCache.set).toHaveBeenCalledWith(
      'all_blog_posts',
      result,
      3600 * 1000,
    );
  });
});
