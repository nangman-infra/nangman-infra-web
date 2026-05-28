import { BlogPostRepositoryPort } from '../../domain/ports/blog-post-repository.port';
import { GetBlogPostsPageUseCase } from './get-blog-posts-page.use-case';

describe('GetBlogPostsPageUseCase', () => {
  const repository: jest.Mocked<BlogPostRepositoryPort> = {
    findPage: jest.fn(),
    findExistingLinks: jest.fn(),
    createMany: jest.fn(),
  };

  let useCase: GetBlogPostsPageUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new GetBlogPostsPageUseCase(repository);
  });

  it('translates page/pageSize into offset/limit and returns pagination meta', async () => {
    repository.findPage.mockResolvedValue({
      posts: [],
      total: 47,
    });

    const result = await useCase.execute({ page: 3, pageSize: 20 });

    expect(repository.findPage).toHaveBeenCalledWith({
      offset: 40,
      limit: 20,
    });
    expect(result).toEqual({
      posts: [],
      total: 47,
      page: 3,
      pageSize: 20,
      totalPages: 3,
    });
  });

  it('returns totalPages=0 when there are no posts', async () => {
    repository.findPage.mockResolvedValue({ posts: [], total: 0 });

    const result = await useCase.execute({ page: 1, pageSize: 20 });

    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});
