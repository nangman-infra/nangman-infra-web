"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Activity, ArrowUpRight, ChevronDown, Globe2, Info, LockKeyhole, RefreshCw, Shield, ShieldCheck, ShieldX, WifiOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSecurityOverview } from "@/hooks/useSecurityOverview";
import { categoryName, countryName, eventTime, type SecurityFilter, type SecurityLocale } from "@/lib/domain/security";
import { SecurityWorldMap } from "@/components/security/SecurityWorldMap";
import { SecurityEventList } from "@/components/security/SecurityEventList";

function Metric({ label, value, detail, icon: Icon, tone, pending }: {
  label: string; value: number | null; detail: string; icon: LucideIcon;
  tone: "amber" | "green" | "blue" | "neutral"; pending: boolean;
}) {
  const colors = {
    amber: "text-amber-500 dark:text-amber-400 bg-amber-500/10",
    green: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
    blue: "text-sky-500 dark:text-sky-400 bg-sky-500/10",
    neutral: "text-foreground/70 bg-muted/50",
  };
  return <article className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`rounded-lg p-2 ${colors[tone]}`}><Icon className="h-4 w-4" /></span>
    </div>
    <p className={`mt-3 font-mono text-3xl font-medium tracking-tight sm:text-4xl ${pending ? "motion-safe:animate-pulse text-muted-foreground" : ""}`}>
      {value === null ? "—" : value.toLocaleString()}
    </p>
    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
  </article>;
}

function Ranking({ title, icon: Icon, entries, empty }: {
  title: string; icon: LucideIcon; entries: { label: string; value: number; hint?: string }[]; empty: string;
}) {
  const maximum = Math.max(1, ...entries.map((entry) => entry.value));
  return <section className="min-w-0 rounded-xl border border-border/50 bg-card/30 p-5 sm:p-6">
    <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</h2>
    {entries.length ? <ol className="space-y-4">
      {entries.map((entry, index) => <li key={`${entry.label}:${entry.hint ?? ""}`} className="relative">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="w-4 shrink-0 font-mono text-[10px] text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          {entry.hint && <span className="font-mono text-[10px] text-muted-foreground">{entry.hint}</span>}
          <span className="ml-2 font-mono tabular-nums">{entry.value.toLocaleString()}</span>
        </div>
        <div className="ml-6 h-1 overflow-hidden rounded-full bg-muted/40">
          <div className="h-full rounded-full bg-primary/65 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${entry.value / maximum * 100}%` }} />
        </div>
      </li>)}
    </ol> : <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>}
  </section>;
}

export function SecurityPage() {
  const locale: SecurityLocale = useLocale() === "en" ? "en" : "ko";
  const ko = locale === "ko";
  const [filter, setFilter] = useState<SecurityFilter>("all");
  const { data, error, refreshing, refresh } = useSecurityOverview(filter);
  const sources = data?.sources ?? [];
  const ids = sources.find((source) => source.source === "ids");
  const firewall = sources.find((source) => source.source === "firewall");
  const ready = !!data?.configured;
  const degraded = error || sources.some((source) => source.stale);
  const live = ready && !degraded;
  const waiting = !data && !error;
  const empty = ko ? "현재 조회 결과가 없습니다" : "No results in this response";
  const latestSuccess = sources.map((source) => source.lastSuccess).filter((time): time is string => !!time).sort().at(-1) ?? null;
  const selectedSources = sources.filter((source) => filter === "all" || source.source === filter);
  const selectedCount = selectedSources.reduce((count, source) => count + source.matched, 0);

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="relative mx-auto max-w-7xl space-y-7">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-primary">
            <Shield className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Infrastructure / Security</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{ko ? "보이지 않는 곳에서도, 안전하게." : "Security, beyond the surface."}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {ko ? "낭만 인프라로 들어오는 트래픽, 탐지부터 차단까지 한눈에 확인하세요." :
              "A live view of inbound traffic, threat detection, and protection at Nangman Infra."}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span role="status" className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] tracking-wider ${
              live ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-500 dark:text-emerald-400" : "border-border bg-muted/30 text-muted-foreground"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 motion-safe:animate-pulse" : "bg-current"}`} />
              {live ? "LIVE" : waiting ? "CONNECTING" : "UPDATE DELAYED"}
            </span>
            <span className="text-muted-foreground">OPNsense <span className="mx-1 text-border">/</span> Suricata</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="font-mono text-[10px] sm:text-[11px]">{eventTime(latestSuccess, locale)} KST</span>
            <span className="hidden sm:inline">{ko ? "10초마다 갱신" : "Refreshes every 10s"}</span>
            <button type="button" onClick={refresh} disabled={refreshing}
              aria-label={ko ? "보안 데이터 새로고침" : "Refresh security data"}
              className="rounded-md border border-border/50 p-2 transition-colors hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-40">
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "motion-safe:animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {(error || (data && (!ready || degraded))) && <div role="status" className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs leading-relaxed text-amber-700 dark:text-amber-300">
          <WifiOff className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{!ready && data ? (ko ? "보안 데이터 연결을 준비하고 있습니다. 연결 후 실제 조회 결과가 표시됩니다." : "The security data connection is being configured.") :
            ko ? "일부 데이터 갱신이 지연되고 있습니다. 표시된 값은 마지막으로 조회에 성공한 결과입니다." : "Some updates are delayed. Values show the last successful response."}</p>
        </div>}

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          <Metric label={ko ? "침입 탐지 이벤트" : "IDS detections"} value={ids?.lastSuccess ? data!.summary.detections : null}
            detail={ko ? "Suricata · 조회된 외부 유입 탐지" : "Suricata · Inbound detections"} icon={Activity} tone="amber" pending={waiting} />
          <Metric label={ko ? "IPS 차단" : "IPS blocked"} value={ids?.lastSuccess ? data!.summary.ipsBlocked : null}
            detail={ko ? "침입 탐지 이벤트 중 실제 차단" : "Blocked subset of IDS detections"} icon={ShieldCheck} tone="green" pending={waiting} />
          <Metric label={ko ? "방화벽 차단" : "Firewall blocked"} value={firewall?.lastSuccess ? data!.summary.firewallBlocked : null}
            detail={ko ? "WAN · 외부 유입 정책 차단" : "WAN · Inbound policy blocks"} icon={ShieldX} tone="blue" pending={waiting} />
          <Metric label={ko ? "관측 국가" : "Origin countries"} value={latestSuccess && data?.geoAvailable ? data.summary.countries : null}
            detail={ko ? "전체 조회 결과 · 미확인 국가 제외" : "All sources · Excludes unknown origins"} icon={Globe2} tone="neutral" pending={waiting} />
        </div>
        <p className="-mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />
          {ko ? "OPNsense의 최신 로그 조회 기준이며, 일일 누적 수치가 아닙니다. 출처별 조회 범위는 아래에서 확인할 수 있습니다." :
            "Based on the latest OPNsense logs, not daily totals. Each source’s time range is available below."}
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{ko ? "이벤트 탐색" : "Explore events"}</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{data ? selectedCount.toLocaleString(locale) : "—"} {ko ? "건 관측" : "OBSERVED"}</span>
            </div>
            <div aria-label={ko ? "이벤트 데이터 종류" : "Event source"} className="flex items-center rounded-lg border border-border/50 bg-card/30 p-1">
              {(["all", "ids", "firewall"] as const).map((source) => <button key={source} type="button"
                aria-pressed={filter === source} onClick={() => setFilter(source)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  filter === source ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {source === "all" ? (ko ? "전체" : "All") : source === "ids" ? "Suricata" : "Firewall"}
              </button>)}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SecurityWorldMap countries={data?.countries ?? []} locale={locale} loading={waiting} geoAvailable={data?.geoAvailable ?? false} />
            <Ranking title={ko ? "주요 출발 국가" : "Top origins"} icon={Globe2} empty={empty}
              entries={(data?.countries ?? []).slice(0, 6).map((country) => ({
                label: countryName(country.code, locale), hint: country.code, value: country.count,
              }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Ranking title={ko ? "관측 유형" : "Event categories"} icon={Activity} empty={empty}
              entries={(data?.categories ?? []).slice(0, 6).map((category) => ({
                label: categoryName(category.name, locale), value: category.count,
              }))} />
            <Ranking title={ko ? "주요 대상 포트" : "Top destination ports"} icon={ArrowUpRight} empty={empty}
              entries={(data?.ports ?? []).map((port) => ({ label: String(port.port), hint: port.protocol, value: port.count }))} />
          </div>
          <SecurityEventList events={data?.events ?? []} locale={locale} loading={waiting} />
        </div>

        <details className="group rounded-xl border border-border/40 bg-card/20">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-xs text-muted-foreground [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-2"><Info className="h-3.5 w-3.5" />{ko ? "데이터 범위와 조회 상태" : "Data coverage & source status"}</span>
            <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="space-y-4 border-t border-border/40 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
            <p>{ko ? "숫자는 OPNsense의 최신 조회 결과입니다. 하루 누적이나 전체 공격 건수가 아니며, 출처마다 조회되는 시간 범위가 다릅니다. IPS 차단은 침입 탐지에 포함됩니다. 방화벽 정책 차단이 모두 공격을 의미하지는 않습니다." :
              "Counts reflect the latest OPNsense response, not daily totals or all attacks. Each source covers a different time range. IPS blocks are included in IDS detections. Firewall policy blocks do not necessarily indicate attacks."}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {sources.map((source) => <div key={source.source} className="rounded-lg border border-border/40 p-3">
                <p className="flex items-center justify-between font-medium text-foreground/80">
                  {source.source === "ids" ? "Suricata IDS / IPS" : "WAN Firewall"}
                  <span className={source.stale ? "text-amber-500" : "text-emerald-500"}>{source.stale ? (ko ? "조회 지연" : "Delayed") : (ko ? "조회 정상" : "Connected")}</span>
                </p>
                <p className="mt-2">{ko ? "수신 / 표시 대상" : "Received / matched"}: {source.received.toLocaleString(locale)} / {source.matched.toLocaleString(locale)} · {ko ? "최대" : "Limit"} {source.limit.toLocaleString(locale)}</p>
                <p className="mt-1 font-mono text-[10px]">{eventTime(source.oldest, locale, true)} — {eventTime(source.newest, locale, true)} KST</p>
                <p className="mt-1">{ko ? "마지막 조회" : "Last success"}: {eventTime(source.lastSuccess, locale, true)}</p>
                {source.error && <p className="mt-1 text-amber-500">{source.error === "permission" ? (ko ? "조회 권한 확인 필요" : "Read permission unavailable") :
                  source.error === "configuration" ? (ko ? "데이터 연결 설정 확인 필요" : "Source configuration unavailable") :
                    (ko ? "장비 연결 재시도 중" : "Retrying appliance connection")}</p>}
              </div>)}
            </div>
            <p>{ko ? "탐지 엔진" : "Detection engine"}: {data?.engine.status === "running" ? (ko ? "실행 중" : "Running") : data?.engine.status === "stopped" ? (ko ? "중지됨" : "Stopped") : (ko ? "확인 대기" : "Unknown")}
              {data?.engine.enabledRulesets !== null && data?.engine.enabledRulesets !== undefined &&
                ` · ${ko ? "활성 규칙 묶음" : "Enabled rulesets"} ${data.engine.enabledRulesets}`}</p>
          </div>
        </details>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] leading-relaxed text-muted-foreground/70">
          <p className="flex items-center gap-1.5"><LockKeyhole className="h-3 w-3" />{ko ? "조회 전용 연결 · 별도 이벤트 저장 없음 · 10초마다 갱신" : "Read-only connection · No event storage · Refreshes every 10s"}</p>
          <p>Geo: <a href="https://db-ip.com/db/lite.php" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">DB-IP Lite</a> (CC BY 4.0) · Map: Natural Earth</p>
        </div>
      </div>
    </div>
  );
}
