import { RefreshCw, WifiOff } from "lucide-react";
import type { SecurityCopy } from "@/content/security";
import { eventTime, type SecurityLocale, type SecuritySnapshot } from "@/lib/domain/security";

type StatusProps = {
  live: boolean;
  waiting: boolean;
  latestSuccess: string | null;
  locale: SecurityLocale;
  copy: SecurityCopy;
  refreshing: boolean;
  refresh: () => void;
};

function connectionLabel(live: boolean, waiting: boolean): string {
  if (live) return "LIVE";
  return waiting ? "CONNECTING" : "UPDATE DELAYED";
}

export function SecurityConnectionStatus({ live, waiting, latestSuccess, locale, copy, refreshing, refresh }: Readonly<StatusProps>) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 text-xs">
    <div className="flex flex-wrap items-center gap-3">
      <output className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-wider ${
        live ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400" : "border-border bg-muted/30 text-muted-foreground"
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-current"}`} />
        {connectionLabel(live, waiting)}
      </output>
      <span className="text-muted-foreground">OPNsense <span className="mx-1 text-border">/</span> Suricata</span>
    </div>
    <div className="flex items-center gap-3 text-muted-foreground">
      <span className="font-mono text-[10px] sm:text-[11px]">{eventTime(latestSuccess, locale)} KST</span>
      <span className="hidden sm:inline">{copy.refreshInterval}</span>
      <button type="button" onClick={refresh} disabled={refreshing} aria-label={copy.refresh}
        className="rounded-md border border-border/50 p-2 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40">
        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "motion-safe:animate-spin" : ""}`} />
      </button>
    </div>
  </div>;
}

export function SecurityConnectionNotice({ data, error, degraded, copy }: Readonly<{
  data: SecuritySnapshot | null;
  error: boolean;
  degraded: boolean;
  copy: SecurityCopy;
}>) {
  const unconfigured = data !== null && !data.configured;
  const show = error || (data !== null && (unconfigured || degraded));
  if (!show) return null;
  return <output className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
    <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{unconfigured ? copy.configuring : copy.delayed}</span>
  </output>;
}
