import type { SecurityFilter, SecuritySnapshot } from "@/lib/domain/security";

export function securityView(data: SecuritySnapshot | null, error: boolean, filter: SecurityFilter) {
  const sources = data?.sources ?? [];
  const idsReady = sources.some((source) => source.source === "ids" && source.lastSuccess);
  const firewallReady = sources.some((source) => source.source === "firewall" && source.lastSuccess);
  const degraded = error || sources.some((source) => source.stale);
  const latestSuccess = sources
    .map((source) => source.lastSuccess)
    .filter((time): time is string => !!time)
    .sort((left, right) => left.localeCompare(right))
    .at(-1) ?? null;
  const selectedCount = sources
    .filter((source) => filter === "all" || source.source === filter)
    .reduce((count, source) => count + source.matched, 0);
  return {
    degraded,
    live: !!data?.configured && !degraded,
    waiting: !data && !error,
    latestSuccess,
    selectedCount,
    detections: idsReady && data ? data.summary.detections : null,
    ipsBlocked: idsReady && data ? data.summary.ipsBlocked : null,
    firewallBlocked: firewallReady && data ? data.summary.firewallBlocked : null,
    countries: latestSuccess && data?.geoAvailable ? data.summary.countries : null,
  };
}
