import { DirectusBlogSourceProviderAdapter } from './directus-blog-source-provider.adapter';
import { DirectusHttpClient } from './directus-http-client';

describe('DirectusBlogSourceProviderAdapter', () => {
  const http = { get: jest.fn() } as unknown as jest.Mocked<DirectusHttpClient>;
  let adapter: DirectusBlogSourceProviderAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new DirectusBlogSourceProviderAdapter(http);
  });

  it('returns parsed enabled sources from Directus', async () => {
    http.get.mockResolvedValue({
      data: [
        {
          id: 1,
          name: '이성원',
          rss_url: 'https://judo0179.tistory.com/rss',
          platform: 'tistory',
          profile_image: '/profiles/seongwon.png',
        },
        {
          id: 2,
          name: '강윤서',
          rss_url: 'https://v2.velog.io/rss/yxxunseo',
          platform: 'velog',
          profile_image: null,
        },
      ],
    });

    const sources = await adapter.getEnabledSources();

    expect(http.get).toHaveBeenCalledWith('/items/blog_sources', {
      'filter[enabled][_eq]': 'true',
      sort: 'sort',
      limit: -1,
    });
    expect(sources).toEqual([
      {
        id: 1,
        name: '이성원',
        rssUrl: 'https://judo0179.tistory.com/rss',
        platform: 'tistory',
        profileImage: '/profiles/seongwon.png',
      },
      {
        id: 2,
        name: '강윤서',
        rssUrl: 'https://v2.velog.io/rss/yxxunseo',
        platform: 'velog',
        profileImage: null,
      },
    ]);
  });

  it('drops rows with missing required fields', async () => {
    http.get.mockResolvedValue({
      data: [
        { id: 1, name: '이성원', rss_url: 'https://x', platform: 'tistory' },
        { id: 2, name: null, rss_url: 'https://x', platform: 'tistory' }, // null name
        { id: 3, name: '강윤서', rss_url: '', platform: 'velog' }, // empty rss_url
        { id: 4, name: '강윤서', rss_url: 'https://x', platform: 'unknown' }, // bad platform
      ],
    });

    const sources = await adapter.getEnabledSources();
    expect(sources).toHaveLength(1);
    expect(sources[0].name).toBe('이성원');
  });

  it('parses string id as positive integer', async () => {
    http.get.mockResolvedValue({
      data: [
        {
          id: '7',
          name: 'a',
          rss_url: 'https://x',
          platform: 'tistory',
        },
      ],
    });

    const sources = await adapter.getEnabledSources();
    expect(sources[0].id).toBe(7);
  });

  it('returns empty array when payload is not an array', async () => {
    http.get.mockResolvedValue({ data: 'not-array' });
    expect(await adapter.getEnabledSources()).toEqual([]);
  });

  it('returns empty array and logs when http fails', async () => {
    http.get.mockRejectedValue(new Error('directus down'));
    expect(await adapter.getEnabledSources()).toEqual([]);
  });
});
