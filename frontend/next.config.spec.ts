import { access } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import nextConfig from './next.config';

describe('profile image rewrites', () => {
  it('serves the existing photo at the Heejun URL stored in Directus', async () => {
    const rewrites = await nextConfig.rewrites?.();
    expect(Array.isArray(rewrites)).toBe(true);
    if (!Array.isArray(rewrites)) {
      throw new Error('Expected an array of rewrites');
    }

    const rewrite = rewrites.find((rule) => rule.source === '/profiles/heejun.png');
    expect(rewrite?.destination).toBe('/profiles/hejun.jpeg');
    await expect(
      access(path.join(import.meta.dirname, 'public', rewrite!.destination)),
    ).resolves.toBeUndefined();
  });
});
