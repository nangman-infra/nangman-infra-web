import { BlogPlatform } from './blog-platform';

export interface BlogSource {
  id: number;
  name: string;
  rssUrl: string;
  platform: BlogPlatform;
  profileImage: string | null;
}
