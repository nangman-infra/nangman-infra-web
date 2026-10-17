import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { ipNumber, isPublicAddress } from './security-normalizer';

type CountryRange = { start: bigint; end: bigint; country: string };

/** Offline DB-IP Country Lite lookup. No addresses are sent to a third party. */
export class GeoIpLookup {
  private readonly ranges = new Map<number, CountryRange[]>([
    [4, []],
    [6, []],
  ]);
  private readonly cache = new Map<string, string>();
  readonly available: boolean;

  constructor(path?: string) {
    if (!path) {
      this.available = false;
      return;
    }
    try {
      const bytes = readFileSync(path);
      const csv = (path.endsWith('.gz') ? gunzipSync(bytes) : bytes).toString(
        'utf8',
      );
      for (const line of csv.split(/\r?\n/)) {
        const [from, to, country] = line
          .split(',')
          .map((part) => part.replace(/^"|"$/g, ''));
        if (!from || !to || !/^[A-Z]{2}$/.test(country || '')) continue;
        const start = ipNumber(from);
        const end = ipNumber(to);
        if (start && end && start.version === end.version) {
          this.ranges
            .get(start.version)
            ?.push({ start: start.value, end: end.value, country });
        }
      }
      for (const ranges of this.ranges.values()) {
        ranges.sort((a, b) =>
          a.start < b.start ? -1 : a.start > b.start ? 1 : 0,
        );
      }
      this.available = [...this.ranges.values()].some(
        (ranges) => ranges.length > 0,
      );
    } catch {
      this.available = false;
    }
  }

  lookup(ip: string): string {
    if (!this.available || !isPublicAddress(ip)) return 'ZZ';
    const cached = this.cache.get(ip);
    if (cached) return cached;
    const parsed = ipNumber(ip);
    if (!parsed) return 'ZZ';
    const ranges = this.ranges.get(parsed.version) ?? [];
    let low = 0;
    let high = ranges.length - 1;
    let country = 'ZZ';
    while (low <= high) {
      const middle = (low + high) >>> 1;
      const entry = ranges[middle];
      if (parsed.value < entry.start) high = middle - 1;
      else if (parsed.value > entry.end) low = middle + 1;
      else {
        country = entry.country;
        break;
      }
    }
    if (this.cache.size >= 10_000) this.cache.clear();
    this.cache.set(ip, country);
    return country;
  }
}
