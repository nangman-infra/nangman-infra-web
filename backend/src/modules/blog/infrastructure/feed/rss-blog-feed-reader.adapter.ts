import { Injectable } from '@nestjs/common';
import * as Parser from 'rss-parser';
import axios from 'axios';
import { BlogFeedItem } from '../../domain/blog-feed-item';
import { BlogFeedReaderPort } from '../../domain/ports/blog-feed-reader.port';

@Injectable()
export class RssBlogFeedReaderAdapter implements BlogFeedReaderPort {
  private readonly parser = new Parser();

  async read(rssUrl: string): Promise<BlogFeedItem[]> {
    const response = await axios.get<string>(rssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
      timeout: 5000,
    });

    const feed = await this.parser.parseString(response.data);
    return (feed.items ?? []) as BlogFeedItem[];
  }
}
