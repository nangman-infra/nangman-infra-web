export type BlogPlatform = 'tistory' | 'velog' | 'medium' | 'other';

export function isBlogPlatform(value: unknown): value is BlogPlatform {
  return (
    value === 'tistory' ||
    value === 'velog' ||
    value === 'medium' ||
    value === 'other'
  );
}
