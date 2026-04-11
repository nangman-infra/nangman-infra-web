import { Injectable } from '@nestjs/common';
import { MemberBlogConfig } from '../../domain/member-blog-config';
import { BlogSourceProviderPort } from '../../domain/ports/blog-source-provider.port';

@Injectable()
export class StaticBlogSourceProviderAdapter implements BlogSourceProviderPort {
  private readonly sources: MemberBlogConfig[] = [
    {
      name: 'Seongwon',
      rssUrl: 'https://judo0179.tistory.com/rss',
      platform: 'tistory',
      profileImage: '/profiles/seongwon.png',
    },
    {
      name: 'Juno',
      rssUrl: 'https://se-juno.tistory.com/rss',
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
      name: 'Jungbin',
      rssUrl: 'https://v2.velog.io/rss/jungbin99',
      platform: 'velog',
      profileImage: '/profiles/jungbin.jpeg',
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
    {
      name: 'Unseo',
      rssUrl: 'https://v2.velog.io/rss/yxxunseo',
      platform: 'velog',
      profileImage: '/profiles/unseo.jpg',
    },
  ];

  getSources(): MemberBlogConfig[] {
    return this.sources;
  }
}
