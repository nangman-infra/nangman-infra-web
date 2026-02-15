import { Injectable } from '@nestjs/common';
import { MemberBlogConfig } from '../../domain/member-blog-config';
import { BlogSourceProviderPort } from '../../domain/ports/blog-source-provider.port';

@Injectable()
export class StaticBlogSourceProviderAdapter implements BlogSourceProviderPort {
  private readonly sources: MemberBlogConfig[] = [
    {
      name: 'Juno',
      rssUrl: 'http://se-juno.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/junho.png',
    },
    {
      name: 'Seongwoo',
      rssUrl: 'https://seongw00.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/seongwoo.png',
    },
    {
      name: 'Donggeon',
      rssUrl: 'https://exit0.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/donggeon.png',
    },
    {
      name: 'Taekjun',
      rssUrl: 'https://v2.velog.io/rss/iamtaekjun',
      platform: 'velog',
      profileImage: '/profiles/taekjun.png',
    },
    {
      name: 'Heehoon',
      rssUrl: 'https://heishooni.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/heehoon.png',
    },
    {
      name: 'Juhyung',
      rssUrl: 'https://artist0904.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/juhyung.png',
    },
  ];

  getSources(): MemberBlogConfig[] {
    return this.sources;
  }
}
