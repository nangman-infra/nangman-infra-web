import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { GeoIpLookup } from './geoip.lookup';

describe('offline country lookup', () => {
  let directory: string;
  const csv = [
    '"8.8.8.0","8.8.8.255","US"',
    '2606:4700::,2606:4700:ffff:ffff:ffff:ffff:ffff:ffff,US',
    '1.1.1.0,1.1.1.255,AU',
    'invalid,1.1.1.1,US',
    '2.2.2.0,2.2.2.255,invalid',
    '',
  ].join('\n');

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'nangman-geo-test-'));
  });

  afterEach(() => rmSync(directory, { recursive: true, force: true }));

  it.each(['csv', 'csv.gz'])(
    'loads %s and finds unordered IPv4 and IPv6 ranges',
    (extension) => {
      const path = join(directory, `countries.${extension}`);
      writeFileSync(path, extension === 'csv' ? csv : gzipSync(csv));
      const geo = new GeoIpLookup(path);
      expect(geo.available).toBe(true);
      expect(geo.lookup('8.8.8.0')).toBe('US');
      expect(geo.lookup('8.8.8.255')).toBe('US');
      expect(geo.lookup('1.1.1.1')).toBe('AU');
      expect(geo.lookup('2606:4700:4700::1111')).toBe('US');
      expect(geo.lookup('8.8.8.0')).toBe('US');
      expect(geo.lookup('9.9.9.9')).toBe('ZZ');
      expect(geo.lookup('2.2.2.1')).toBe('ZZ');
      expect(geo.lookup('192.168.1.1')).toBe('ZZ');
      expect(geo.lookup('invalid')).toBe('ZZ');
    },
  );

  it('degrades safely for missing, corrupt or empty databases', () => {
    const corrupt = join(directory, 'corrupt.csv.gz');
    const empty = join(directory, 'empty.csv');
    writeFileSync(corrupt, 'not compressed');
    writeFileSync(empty, '');
    for (const path of [
      undefined,
      join(directory, 'missing.csv'),
      corrupt,
      empty,
    ]) {
      const geo = new GeoIpLookup(path);
      expect(geo.available).toBe(false);
      expect(geo.lookup('8.8.8.8')).toBe('ZZ');
    }
  });
});
