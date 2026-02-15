import { BlogFeedItem } from '../blog-feed-item';

export const BLOG_FEED_READER = Symbol('BLOG_FEED_READER');

export interface BlogFeedReaderPort {
  read(rssUrl: string): Promise<BlogFeedItem[]>;
}
