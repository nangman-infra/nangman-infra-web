import { getLatestBlogPostsUseCase } from '@/lib/application/use-cases/blog/get-latest-blog-posts';
import type { BlogPost as DomainBlogPost } from '@/lib/domain/blog';

export type BlogPost = DomainBlogPost;

// Fallback static data if backend is unreachable
const fallbackPosts: BlogPost[] = [
  {
    title: '네트워크 엔지니어 6개월 회고',
    description:
      'Cisco 골드 파트너사에서 온프렘 네트워크 엔지니어로 6개월 동안 일하며 겪은 교육 과정, 프로젝트 경험, 성장 포인트를 정리한 회고입니다.',
    date: '2025. 06. 13',
    author: 'Juno',
    tags: ['Network', 'Career'],
    slug: 'network-engineer-6-months-retrospective',
    link: 'https://se-juno.tistory.com/18',
    url: 'https://se-juno.tistory.com/18',
    platform: 'tistory',
  },
  // ... (keep one or two as fallback)
];

export function getFallbackBlogPosts(count: number = 3): BlogPost[] {
  return fallbackPosts.slice(0, count);
}

// Get latest blog posts from Next.js BFF API at runtime
export async function getLatestBlogPosts(count: number = 3): Promise<BlogPost[]> {
  return getLatestBlogPostsUseCase({
    count,
    fallback: getFallbackBlogPosts(count),
  });
}
