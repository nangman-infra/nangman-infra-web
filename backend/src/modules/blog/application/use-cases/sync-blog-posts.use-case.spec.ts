import { BlogSource } from '../../domain/blog-source';
import { BlogFeedReaderPort } from '../../domain/ports/blog-feed-reader.port';
import { BlogPostRepositoryPort } from '../../domain/ports/blog-post-repository.port';
import { BlogSourceProviderPort } from '../../domain/ports/blog-source-provider.port';
import { BlogSourceWriterPort } from '../../domain/ports/blog-source-writer.port';
import { SyncBlogPostsUseCase } from './sync-blog-posts.use-case';

describe('SyncBlogPostsUseCase', () => {
  const sources: BlogSource[] = [
    {
      id: 1,
      name: '이성원',
      rssUrl: 'https://judo0179.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/seongwon.png',
    },
    {
      id: 2,
      name: '손준호',
      rssUrl: 'https://se-juno.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/junho.png',
    },
  ];

  const sourceProvider: jest.Mocked<BlogSourceProviderPort> = {
    getEnabledSources: jest.fn(),
  };
  const feedReader: jest.Mocked<BlogFeedReaderPort> = {
    read: jest.fn(),
  };
  const postRepository: jest.Mocked<BlogPostRepositoryPort> = {
    findPage: jest.fn(),
    findExistingLinks: jest.fn(),
    createMany: jest.fn(),
  };
  const sourceWriter: jest.Mocked<BlogSourceWriterPort> = {
    recordSuccess: jest.fn(),
    recordError: jest.fn(),
  };

  let useCase: SyncBlogPostsUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new SyncBlogPostsUseCase(
      sourceProvider,
      feedReader,
      postRepository,
      sourceWriter,
    );
  });

  it('returns an empty summary when no sources are enabled', async () => {
    sourceProvider.getEnabledSources.mockResolvedValue([]);

    const result = await useCase.execute();

    expect(result).toEqual({
      totalSources: 0,
      fetchedItems: 0,
      insertedPosts: 0,
      failedSources: [],
    });
    expect(feedReader.read).not.toHaveBeenCalled();
    expect(postRepository.createMany).not.toHaveBeenCalled();
  });

  it('inserts only posts whose normalized link is not yet in the repository', async () => {
    sourceProvider.getEnabledSources.mockResolvedValue(sources);
    feedReader.read.mockImplementation(async (rssUrl: string) => {
      if (rssUrl.includes('judo0179')) {
        return [
          {
            title: 'New Post',
            content: 'new content',
            link: 'https://judo0179.tistory.com/100/?utm=rss#anchor',
            isoDate: '2026-05-01T10:00:00.000Z',
            categories: ['Infra'],
          },
          {
            title: 'Existing Post',
            content: 'existing',
            link: 'https://judo0179.tistory.com/99',
            isoDate: '2026-04-01T10:00:00.000Z',
            categories: [],
          },
        ];
      }
      if (rssUrl.includes('se-juno')) {
        return [
          {
            title: 'Juno New',
            content: 'juno content',
            link: 'https://se-juno.tistory.com/42/',
            isoDate: '2026-05-02T10:00:00.000Z',
            categories: ['DNS'],
          },
        ];
      }
      return [];
    });
    postRepository.findExistingLinks.mockResolvedValue(
      new Set(['https://judo0179.tistory.com/99']),
    );
    postRepository.createMany.mockResolvedValue(2);

    const result = await useCase.execute();

    expect(postRepository.createMany).toHaveBeenCalledTimes(1);
    const inserted = postRepository.createMany.mock.calls[0][0];
    expect(inserted).toHaveLength(2);
    const links = inserted.map((p) => p.link).sort();
    expect(links).toEqual([
      'https://judo0179.tistory.com/100',
      'https://se-juno.tistory.com/42',
    ]);

    expect(result).toEqual({
      totalSources: 2,
      fetchedItems: 3,
      insertedPosts: 2,
      failedSources: [],
    });

    expect(sourceWriter.recordSuccess).toHaveBeenCalledTimes(2);
    expect(sourceWriter.recordError).not.toHaveBeenCalled();
  });

  it('isolates per-source RSS failures and reports them', async () => {
    sourceProvider.getEnabledSources.mockResolvedValue(sources);
    feedReader.read.mockImplementation(async (rssUrl: string) => {
      if (rssUrl.includes('judo0179')) {
        throw new Error('timeout');
      }
      return [
        {
          title: 'Juno Only',
          content: 'snippet',
          link: 'https://se-juno.tistory.com/1',
          isoDate: '2026-05-02T00:00:00.000Z',
          categories: [],
        },
      ];
    });
    postRepository.findExistingLinks.mockResolvedValue(new Set());
    postRepository.createMany.mockResolvedValue(1);

    const result = await useCase.execute();

    expect(result.totalSources).toBe(2);
    expect(result.fetchedItems).toBe(1);
    expect(result.insertedPosts).toBe(1);
    expect(result.failedSources).toEqual([{ sourceId: 1, error: 'timeout' }]);
    expect(sourceWriter.recordError).toHaveBeenCalledWith(1, 'timeout');
    expect(sourceWriter.recordSuccess).toHaveBeenCalledTimes(1);
    expect(sourceWriter.recordSuccess).toHaveBeenCalledWith(
      2,
      expect.any(Date),
    );
  });

  it('does not write when all candidates already exist', async () => {
    sourceProvider.getEnabledSources.mockResolvedValue([sources[0]]);
    feedReader.read.mockResolvedValue([
      {
        title: 'Dup',
        content: 'dup',
        link: 'https://judo0179.tistory.com/1',
        isoDate: '2026-05-01T10:00:00.000Z',
        categories: [],
      },
    ]);
    postRepository.findExistingLinks.mockResolvedValue(
      new Set(['https://judo0179.tistory.com/1']),
    );

    const result = await useCase.execute();

    expect(postRepository.createMany).not.toHaveBeenCalled();
    expect(result.insertedPosts).toBe(0);
    expect(result.fetchedItems).toBe(1);
  });

  it('dedupes candidates that appear with the same normalized link across sources', async () => {
    sourceProvider.getEnabledSources.mockResolvedValue(sources);
    feedReader.read.mockResolvedValue([
      {
        title: 'Same',
        content: 'same',
        link: 'https://example.com/post/',
        isoDate: '2026-05-01T10:00:00.000Z',
        categories: [],
      },
    ]);
    postRepository.findExistingLinks.mockResolvedValue(new Set());
    postRepository.createMany.mockResolvedValue(1);

    const result = await useCase.execute();

    const inserted = postRepository.createMany.mock.calls[0][0];
    expect(inserted).toHaveLength(1);
    expect(inserted[0].link).toBe('https://example.com/post');
    expect(result.insertedPosts).toBe(1);
  });
});
