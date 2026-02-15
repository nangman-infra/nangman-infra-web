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
