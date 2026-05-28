import { BlogPlatform } from './blog-platform';

export interface BlogPost {
  title: string;
  description: string;
  link: string;
  date: string; // ISO String
  author: string;
  authorImage?: string;
  platform: BlogPlatform;
  tags: string[];
}
