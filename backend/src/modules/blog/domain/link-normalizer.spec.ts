import { normalizeBlogPostLink } from './link-normalizer';

describe('normalizeBlogPostLink', () => {
  it.each([
    [
      'strips trailing slash',
      'https://example.com/post/',
      'https://example.com/post',
    ],
    [
      'strips query string',
      'https://example.com/post?utm=rss',
      'https://example.com/post',
    ],
    [
      'strips hash',
      'https://example.com/post#anchor',
      'https://example.com/post',
    ],
    [
      'lowercases host while preserving path case',
      'https://Example.COM/Post/Slug',
      'https://example.com/Post/Slug',
    ],
    [
      'combines all transforms',
      'HTTPS://Example.COM/Path/?q=1#x',
      'https://example.com/Path',
    ],
  ])('%s', (_, input, expected) => {
    expect(normalizeBlogPostLink(input)).toBe(expected);
  });

  it('returns the input unchanged when not a valid URL', () => {
    expect(normalizeBlogPostLink('not a url')).toBe('not a url');
  });

  it('preserves root path as "/"', () => {
    expect(normalizeBlogPostLink('https://example.com/')).toBe(
      'https://example.com/',
    );
  });
});
