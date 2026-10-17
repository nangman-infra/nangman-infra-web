import { ChevronDown, Info } from "lucide-react";
import type { SecurityCopy } from "@/content/security";
import { eventTime, type SecurityLocale, type SecuritySnapshot, type SecuritySourceState } from "@/lib/domain/security";

function sourceError(error: SecuritySourceState["error"], copy: SecurityCopy): string | null {
  if (error === null) return null;
  const messages = {
    permission: copy.permissionError,
    configuration: copy.configurationError,
    connection: copy.connectionError,
  };
  return messages[error];
}

function SourceCard({ source, locale, copy }: Readonly<{
  source: SecuritySourceState; locale: SecurityLocale; copy: SecurityCopy;
}>) {
  const error = sourceError(source.error, copy);
  return <div className="rounded-lg border border-border/40 p-3">
    <p className="flex items-center justify-between font-medium text-foreground/80">
      {source.source === "ids" ? "Suricata IDS / IPS" : "WAN Firewall"}
      <span className={source.stale ? "text-amber-500" : "text-emerald-500"}>{source.stale ? copy.sourceDelayed : copy.sourceConnected}</span>
    </p>
    <p className="mt-2">{copy.receivedMatched}: {source.received.toLocaleString(locale)} / {source.matched.toLocaleString(locale)} · {copy.limit} {source.limit.toLocaleString(locale)}</p>
    <p className="mt-1 font-mono text-[10px]">{eventTime(source.oldest, locale, true)} — {eventTime(source.newest, locale, true)} KST</p>
    <p className="mt-1">{copy.lastSuccess}: {eventTime(source.lastSuccess, locale, true)}</p>
    {error && <p className="mt-1 text-amber-500">{error}</p>}
  </div>;
}

export function SecuritySourceStatus({ data, locale, copy }: Readonly<{
  data: SecuritySnapshot | null; locale: SecurityLocale; copy: SecurityCopy;
}>) {
  const statuses = { running: copy.engineRunning, stopped: copy.engineStopped, unknown: copy.engineUnknown };
  const status = statuses[data?.engine.status ?? "unknown"];
  const rulesets = data?.engine.enabledRulesets;
  return <details className="group rounded-xl border border-border/40 bg-card/20">
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-xs text-muted-foreground [&::-webkit-details-marker]:hidden">
      <span className="flex items-center gap-2"><Info className="h-3.5 w-3.5" />{copy.coverageTitle}</span>
      <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
    </summary>
    <div className="space-y-4 border-t border-border/40 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
      <p>{copy.coverageNotice}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {(data?.sources ?? []).map((source) => <SourceCard key={source.source} source={source} locale={locale} copy={copy} />)}
      </div>
      <p>{copy.engine}: {status}
        {rulesets !== null && rulesets !== undefined && ` · ${copy.enabledRulesets} ${rulesets}`}
      </p>
    </div>
  </details>;
}
