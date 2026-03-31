import { StaticBlogSourceProviderAdapter } from './static-blog-source-provider.adapter';

describe('StaticBlogSourceProviderAdapter', () => {
  it('includes Unseo velog RSS source', () => {
    const adapter = new StaticBlogSourceProviderAdapter();

    expect(adapter.getSources()).toContainEqual({
      name: 'Unseo',
      rssUrl: 'https://v2.velog.io/rss/yxxunseo',
      platform: 'velog',
      profileImage: '/profiles/unseo.jpg',
    });
  });
});
