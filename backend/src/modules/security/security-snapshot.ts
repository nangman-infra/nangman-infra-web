import type {
  SecurityEvent,
  SecurityFilter,
  SecuritySnapshot,
  SecuritySourceState,
} from './security.types';

/** Aggregate the current bounded response only. Never append to a history. */
export function buildSecuritySnapshot(
  events: SecurityEvent[],
  sources: SecuritySourceState[],
  filter: SecurityFilter,
  configured: boolean,
  geoAvailable: boolean,
  engine: SecuritySnapshot['engine'],
  now = Date.now(),
): SecuritySnapshot {
  const selected = events.filter(
    (event) => filter === 'all' || event.source === filter,
  );
  const countries = new Map<
    string,
    { code: string; count: number; blocked: number }
  >();
  const categories = new Map<string, number>();
  const ports = new Map<
    string,
    { port: number; protocol: string; count: number }
  >();
  for (const event of selected) {
    const country = countries.get(event.country) ?? {
      code: event.country,
      count: 0,
      blocked: 0,
    };
    country.count++;
    if (event.action === 'blocked') country.blocked++;
    countries.set(event.country, country);
    categories.set(event.category, (categories.get(event.category) ?? 0) + 1);
    if (event.port !== null) {
      const key = `${event.protocol}:${event.port}`;
      const port = ports.get(key) ?? {
        port: event.port,
        protocol: event.protocol,
        count: 0,
      };
      port.count++;
      ports.set(key, port);
    }
  }
  return {
    configured,
    generatedAt: new Date(now).toISOString(),
    refreshIntervalSeconds: 10,
    filter,
    // Overview cards describe both sources; the filter belongs to event exploration.
    summary: {
      detections: events.filter((event) => event.source === 'ids').length,
      ipsBlocked: events.filter(
        (event) => event.source === 'ids' && event.action === 'blocked',
      ).length,
      firewallBlocked: events.filter((event) => event.source === 'firewall')
        .length,
      countries: new Set(
        events
          .filter((event) => event.country !== 'ZZ')
          .map((event) => event.country),
      ).size,
    },
    countries: [...countries.values()].sort(
      (a, b) => b.count - a.count || a.code.localeCompare(b.code),
    ),
    categories: [...categories]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
    ports: [...ports.values()]
      .sort((a, b) => b.count - a.count || a.port - b.port)
      .slice(0, 6),
    events: [...selected]
      .sort((a, b) => b.timestamp - a.timestamp || a.id.localeCompare(b.id))
      .slice(0, 20)
      .map((event) => ({
        ...event,
        timestamp: new Date(event.timestamp).toISOString(),
      })),
    sources: sources.map((source) => ({
      ...source,
      stale:
        source.error !== null ||
        source.lastSuccess === null ||
        now - Date.parse(source.lastSuccess) > 30_000,
    })),
    geoAvailable,
    engine: { ...engine },
  };
}
