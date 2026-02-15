export type BlogPlatform = 'tistory' | 'velog' | 'medium' | 'other';

export interface BlogPost {
  title: string;
  description: string;
  link: string;
  date: string;
  author: string;
  authorImage?: string;
  platform: BlogPlatform;
  tags: string[];
  // Legacy fields for current UI compatibility.
  id?: string;
  slug?: string;
  url?: string;
}
