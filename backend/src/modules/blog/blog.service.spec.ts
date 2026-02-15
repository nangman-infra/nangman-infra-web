import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { GetAllBlogPostsUseCase } from './application/use-cases/get-all-blog-posts.use-case';
import { BlogPost } from './blog.interface';

const mockGetAllBlogPostsUseCase = {
  execute: jest.fn(),
};

describe('BlogService', () => {
  let service: BlogService;
  let getAllBlogPostsUseCase: GetAllBlogPostsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: GetAllBlogPostsUseCase,
          useValue: mockGetAllBlogPostsUseCase,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
    getAllBlogPostsUseCase = module.get<GetAllBlogPostsUseCase>(
      GetAllBlogPostsUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return posts from use case', async () => {
    const expectedPosts: BlogPost[] = [
      {
        title: 'Test Post',
        description: 'Test Description',
        link: 'https://example.com/post',
        date: new Date().toISOString(),
        author: 'Juno',
        authorImage: '/profiles/junho.png',
        platform: 'tistory',
        tags: ['test'],
      },
    ];
    mockGetAllBlogPostsUseCase.execute.mockResolvedValue(expectedPosts);
    const actualPosts = await service.getAllPosts();

    expect(getAllBlogPostsUseCase.execute).toHaveBeenCalledTimes(1);
    expect(actualPosts).toEqual(expectedPosts);
  });
});
