import { Test, TestingModule } from '@nestjs/testing';
import { BlogService } from './blog.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('BlogService Verification', () => {
  let service: BlogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<BlogService>(BlogService);
  });

  it('should fetch posts from ALL members', async () => {
    jest.setTimeout(30000);
    const posts = await service.getAllPosts();

    // Group by author
    const authorCounts = posts.reduce(
      (acc, post) => {
        acc[post.author] = (acc[post.author] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log('---------------------------------------------------');
    console.log('📊 RSS Feed Collection Status per Member:');
    console.log('---------------------------------------------------');

    const members = [
      'Juno',
      'Seongwoo',
      'Donggeon',
      'Taekjun',
      'Heehoon',
      'Juhyung',
    ];
    let allSuccess = true;

    members.forEach((member) => {
      const count = authorCounts[member] || 0;
      const status = count > 0 ? '✅ OK' : '❌ FAILED (0 posts)';
      if (count === 0) allSuccess = false;
      console.log(`[${member.padEnd(10)}] : ${count} posts  \t${status}`);
    });
    console.log('---------------------------------------------------');
    console.log(`Total Posts Fetched: ${posts.length}`);
    console.log('---------------------------------------------------');

    expect(allSuccess).toBe(true);
  });
});
