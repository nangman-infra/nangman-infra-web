import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import {
  BlogPostPage,
  GetBlogPostsPageUseCase,
} from './application/use-cases/get-blog-posts-page.use-case';
import {
  BLOG_SOURCE_PROVIDER,
  BlogSourceProviderPort,
} from './domain/ports/blog-source-provider.port';

const mockGetBlogPostsPageUseCase = { execute: jest.fn() };
const mockSourceProvider: jest.Mocked<BlogSourceProviderPort> = {
  getEnabledSources: jest.fn(),
};

describe('BlogService', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: GetBlogPostsPageUseCase,
          useValue: mockGetBlogPostsPageUseCase,
        },
        {
          provide: BLOG_SOURCE_PROVIDER,
          useValue: mockSourceProvider,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    jest.clearAllMocks();
  });

  it('delegates pagination request to the use case', async () => {
    const expected: BlogPostPage = {
      posts: [
        {
          title: 'Test Post',
          description: 'desc',
          link: 'https://example.com/post',
          date: new Date().toISOString(),
          author: '이성원',
          authorImage: '/profiles/seongwon.png',
          platform: 'tistory',
          tags: ['k8s'],
        },
      ],
      total: 1,
      page: 1,
      pageSize: 20,
      totalPages: 1,
    };
    mockGetBlogPostsPageUseCase.execute.mockResolvedValue(expected);

    const actual = await service.getPostsPage({ page: 1, pageSize: 20 });

    expect(actual).toEqual(expected);
    expect(mockGetBlogPostsPageUseCase.execute).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
    });
  });

  it('returns sorted unique author names from enabled sources', async () => {
    mockSourceProvider.getEnabledSources.mockResolvedValue([
      {
        id: 1,
        name: '이성원',
        rssUrl: 'a',
        platform: 'tistory',
        profileImage: null,
      },
      {
        id: 2,
        name: '강윤서',
        rssUrl: 'b',
        platform: 'velog',
        profileImage: null,
      },
    ]);

    const result = await service.getAuthors();

    expect(result.authors).toEqual(['강윤서', '이성원']);
  });
});
