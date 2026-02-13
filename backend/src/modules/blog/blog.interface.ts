export interface BlogPost {
  title: string;
  description: string;
  link: string;
  date: string; // ISO String
  author: string;
  authorImage?: string;
  platform: 'tistory' | 'velog' | 'medium' | 'other';
  tags: string[];
}

export interface MemberBlogConfig {
  name: string;
  rssUrl: string;
  profileImage: string;
  platform: 'tistory' | 'velog' | 'medium' | 'other';
}
