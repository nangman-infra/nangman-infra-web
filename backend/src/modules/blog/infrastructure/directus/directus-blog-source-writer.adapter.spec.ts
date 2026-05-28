import { DirectusBlogSourceWriterAdapter } from './directus-blog-source-writer.adapter';
import { DirectusHttpClient } from './directus-http-client';

describe('DirectusBlogSourceWriterAdapter', () => {
  const http = {
    patch: jest.fn(),
  } as unknown as jest.Mocked<DirectusHttpClient>;
  let adapter: DirectusBlogSourceWriterAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new DirectusBlogSourceWriterAdapter(http);
  });

  it('records success with ISO timestamp and clears last_error', async () => {
    http.patch.mockResolvedValue({ data: {} });

    const at = new Date('2026-05-01T12:34:56.000Z');
    await adapter.recordSuccess(7, at);

    expect(http.patch).toHaveBeenCalledWith('/items/blog_sources/7', {
      last_success_at: '2026-05-01T12:34:56.000Z',
      last_error: null,
    });
  });

  it('records error message truncated to 1000 chars', async () => {
    http.patch.mockResolvedValue({ data: {} });

    const longMessage = 'x'.repeat(1500);
    await adapter.recordError(7, longMessage);

    const body = http.patch.mock.calls[0][1] as { last_error: string };
    expect(body.last_error.length).toBe(1000);
    expect(body.last_error.endsWith('...')).toBe(true);
  });

  it('leaves short error messages unchanged', async () => {
    http.patch.mockResolvedValue({ data: {} });

    await adapter.recordError(7, 'short error');

    expect(http.patch.mock.calls[0][1]).toEqual({
      last_error: 'short error',
    });
  });

  it('swallows write failures (observability path must not crash sync)', async () => {
    http.patch.mockRejectedValue(new Error('directus down'));

    await expect(adapter.recordSuccess(7, new Date())).resolves.toBeUndefined();
    await expect(adapter.recordError(7, 'msg')).resolves.toBeUndefined();
  });
});
