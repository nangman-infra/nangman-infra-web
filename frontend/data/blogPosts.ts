import { INTERNAL_API_ORIGIN } from '@/lib/config';

// Blog posts data structure matching Backend API
export interface BlogPost {
  title: string;
  description: string;
  link: string; // Backend returns 'link'
  date: string;
  author: string;
  authorImage?: string;
  platform: 'tistory' | 'velog' | 'medium' | 'other';
  tags: string[];
  // Legacy fields for compatibility (optional or mapped)
  id?: string;
  slug?: string;
  url?: string; // Mapped from link
}

// Fallback static data if backend is unreachable
const fallbackPosts: BlogPost[] = [
  {
    title: "네트워크 엔지니어 6개월 회고",
    description:
      "Cisco 골드 파트너사에서 온프렘 네트워크 엔지니어로 6개월 동안 일하며 겪은 교육 과정, 프로젝트 경험, 성장 포인트를 정리한 회고입니다.",
    date: "2025. 06. 13",
    author: "Juno",
    tags: ["Network", "Career"],
    slug: "network-engineer-6-months-retrospective",
    link: "https://se-juno.tistory.com/18",
    url: "https://se-juno.tistory.com/18",
    platform: "tistory",
  },
  // ... (keep one or two as fallback)
];

interface BlogProxyResponse {
  success?: boolean;
  data?: unknown;
}

const BLOG_API_PATH = '/api/blog/posts';

function isBlogPlatform(value: unknown): value is BlogPost['platform'] {
  return (
    value === 'tistory' ||
    value === 'velog' ||
    value === 'medium' ||
    value === 'other'
  );
}

function isBlogPost(value: unknown): value is BlogPost {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const tags = candidate.tags;
  const hasValidTags = Array.isArray(tags) && tags.every((tag) => typeof tag === 'string');

  return (
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.link === 'string' &&
    typeof candidate.date === 'string' &&
    typeof candidate.author === 'string' &&
    hasValidTags &&
    isBlogPlatform(candidate.platform) &&
    (candidate.authorImage === undefined ||
      typeof candidate.authorImage === 'string')
  );
}

function withLegacyFields(post: BlogPost): BlogPost {
  return {
    ...post,
    url: post.link,
    id: post.link,
    slug: post.link,
  };
}

function parseBlogPosts(payload: unknown): BlogPost[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const response = payload as BlogProxyResponse;
  if (!Array.isArray(response.data)) {
    return [];
  }

  return response.data.filter(isBlogPost).map(withLegacyFields);
}

function getBlogApiUrl(): string {
  if (typeof window !== 'undefined') {
    return BLOG_API_PATH;
  }
  return `${INTERNAL_API_ORIGIN}${BLOG_API_PATH}`;
}

// Get latest blog posts through Next.js BFF API
export async function getLatestBlogPosts(count: number = 3): Promise<BlogPost[]> {
  const apiUrl = getBlogApiUrl();

  try {
    const response = await fetch(apiUrl, {
      next: { revalidate: 60 }, // Revalidate every 60s
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.status}`);
    }

    const payload = (await response.json()) as unknown;
    const posts = parseBlogPosts(payload);
    return posts.slice(0, count);
  } catch (error) {
    console.error('❌ [Frontend] Failed to fetch blog posts from BFF API');
    console.error('   - Target URL:', apiUrl);
    console.error('   - Error Details:', error);
    return fallbackPosts.slice(0, count);
  }
}
