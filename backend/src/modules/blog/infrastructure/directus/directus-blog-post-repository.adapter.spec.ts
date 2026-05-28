import { DirectusBlogPostRepositoryAdapter } from './directus-blog-post-repository.adapter';
import { DirectusHttpClient } from './directus-http-client';

describe('DirectusBlogPostRepositoryAdapter', () => {
  const http = {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  } as unknown as jest.Mocked<DirectusHttpClient>;
  let adapter: DirectusBlogPostRepositoryAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new DirectusBlogPostRepositoryAdapter(http);
  });

  describe('findPage', () => {
    it('passes pagination, filter, search, and sort through to Directus', async () => {
      http.get.mockResolvedValue({
        data: [
          {
            title: 't',
            description: 'd',
            link: 'https://example.com/a',
            published_at: '2026-05-01T10:00:00.000Z',
            tags: ['k8s'],
            source: {
              name: '이성원',
              profile_image: '/profiles/seongwon.png',
              platform: 'tistory',
            },
          },
        ],
        meta: { total_count: 100, filter_count: 5 },
      });

      const result = await adapter.findPage({
        offset: 20,
        limit: 20,
        author: '이성원',
        search: 'k8s',
        sort: 'oldest',
      });

      expect(http.get).toHaveBeenCalledTimes(1);
      const [path, params] = http.get.mock.calls[0];
      expect(path).toBe('/items/blog_posts');
      expect(params).toMatchObject({
        sort: 'published_at',
        limit: 20,
        offset: 20,
        meta: 'total_count,filter_count',
        'filter[source][name][_eq]': '이성원',
        search: 'k8s',
      });
      expect(result.total).toBe(5); // filter_count preferred
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0]).toMatchObject({
        title: 't',
        author: '이성원',
        authorImage: '/profiles/seongwon.png',
        platform: 'tistory',
        tags: ['k8s'],
      });
    });

    it('omits filter param when author is empty/whitespace', async () => {
      http.get.mockResolvedValue({ data: [], meta: { total_count: 0 } });

      await adapter.findPage({ offset: 0, limit: 20, author: '   ' });

      const params = http.get.mock.calls[0][1];
      expect(params).not.toHaveProperty('filter[source][name][_eq]');
    });

    it('maps sort=author to source.name with secondary published_at desc', async () => {
      http.get.mockResolvedValue({ data: [], meta: { total_count: 0 } });

      await adapter.findPage({ offset: 0, limit: 20, sort: 'author' });

      expect(http.get.mock.calls[0][1]?.sort).toBe('source.name,-published_at');
    });

    it('defaults to latest sort when not specified', async () => {
      http.get.mockResolvedValue({ data: [], meta: { total_count: 0 } });

      await adapter.findPage({ offset: 0, limit: 20 });

      expect(http.get.mock.calls[0][1]?.sort).toBe('-published_at');
    });

    it('falls back to total_count when filter_count is absent', async () => {
      http.get.mockResolvedValue({
        data: [],
        meta: { total_count: 42 },
      });

      const result = await adapter.findPage({ offset: 0, limit: 20 });
      expect(result.total).toBe(42);
    });

    it('drops malformed post rows during parsing', async () => {
      http.get.mockResolvedValue({
        data: [
          { title: 'no source' }, // no source
          {
            title: 'good',
            description: 'd',
            link: 'https://example.com/x',
            published_at: '2026-05-01T00:00:00.000Z',
            tags: [],
            source: { name: '이성원', platform: 'tistory' },
          },
          {
            title: 'bad date',
            description: 'd',
            link: 'https://example.com/y',
            published_at: 'not-a-date',
            tags: [],
            source: { name: '이성원', platform: 'tistory' },
          },
        ],
        meta: { total_count: 3 },
      });

      const result = await adapter.findPage({ offset: 0, limit: 20 });
      expect(result.posts).toHaveLength(1);
      expect(result.posts[0].title).toBe('good');
    });

    it('returns empty result when http throws', async () => {
      http.get.mockRejectedValue(new Error('boom'));
      const result = await adapter.findPage({ offset: 0, limit: 20 });
      expect(result).toEqual({ posts: [], total: 0 });
    });
  });

  describe('findExistingLinks', () => {
    it('returns empty set when no links given', async () => {
      const found = await adapter.findExistingLinks([]);
      expect(found.size).toBe(0);
      expect(http.get).not.toHaveBeenCalled();
    });

    it('chunks queries and aggregates returned links', async () => {
      const links = Array.from(
        { length: 65 },
        (_, i) => `https://example.com/${i}`,
      );
      http.get
        .mockResolvedValueOnce({
          data: links.slice(0, 30).map((link) => ({ link })),
        })
        .mockResolvedValueOnce({
          data: links.slice(30, 60).map((link) => ({ link })),
        })
        .mockResolvedValueOnce({
          data: links.slice(60).map((link) => ({ link })),
        });

      const found = await adapter.findExistingLinks(links);
      expect(http.get).toHaveBeenCalledTimes(3);
      expect(found.size).toBe(65);
      expect(found.has('https://example.com/0')).toBe(true);
      expect(found.has('https://example.com/64')).toBe(true);
    });

    it('ignores non-array responses', async () => {
      http.get.mockResolvedValue({ data: null });
      const found = await adapter.findExistingLinks(['https://example.com/a']);
      expect(found.size).toBe(0);
    });
  });

  describe('createMany', () => {
    it('returns 0 without POSTing when no posts', async () => {
      const result = await adapter.createMany([]);
      expect(result).toBe(0);
      expect(http.post).not.toHaveBeenCalled();
    });

    it('translates camelCase to snake_case and posts as array', async () => {
      http.post.mockResolvedValue({ data: [] });

      const result = await adapter.createMany([
        {
          title: 't',
          description: 'd',
          link: 'https://example.com/a',
          publishedAt: '2026-05-01T00:00:00.000Z',
          tags: ['x'],
          sourceId: 5,
        },
      ]);

      expect(result).toBe(1);
      expect(http.post).toHaveBeenCalledWith('/items/blog_posts', [
        {
          title: 't',
          description: 'd',
          link: 'https://example.com/a',
          published_at: '2026-05-01T00:00:00.000Z',
          tags: ['x'],
          source: 5,
        },
      ]);
    });
  });
});
