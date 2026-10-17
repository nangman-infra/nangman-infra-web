"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Activity, ArrowUpRight, Globe2, Info, LockKeyhole, Shield, ShieldCheck, ShieldX } from "lucide-react";
import { getSecurityCopy } from "@/content/security";
import { useSecurityOverview } from "@/hooks/useSecurityOverview";
import { categoryName, countryName, type SecurityFilter, type SecurityLocale } from "@/lib/domain/security";
import { securityView } from "@/lib/domain/security-view";
import { SecurityWorldMap } from "@/components/security/SecurityWorldMap";
import { SecurityEventList } from "@/components/security/SecurityEventList";
import { SecurityMetric } from "@/components/security/SecurityMetric";
import { SecurityRanking } from "@/components/security/SecurityRanking";
import { SecurityConnectionStatus, SecurityConnectionNotice } from "@/components/security/SecurityConnectionStatus";
import { SecuritySourceStatus } from "@/components/security/SecuritySourceStatus";

export function SecurityPage() {
  const locale: SecurityLocale = useLocale() === "en" ? "en" : "ko";
  const copy = getSecurityCopy(locale);
  const [filter, setFilter] = useState<SecurityFilter>("all");
  const { data, error, refreshing, refresh } = useSecurityOverview(filter);
  const view = securityView(data, error, filter);
  const filterLabels = { all: copy.all, ids: "Suricata", firewall: "Firewall" };

  return (
    <div className="min-h-screen px-4 pb-16 pt-24">
      <div className="relative mx-auto max-w-7xl space-y-7">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-primary">
            <Shield className="h-4 w-4" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] opacity-70">Infrastructure / Security</span>
          </div>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">{copy.title}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{copy.description}</p>
        </div>

        <SecurityConnectionStatus live={view.live} waiting={view.waiting} latestSuccess={view.latestSuccess}
          locale={locale} copy={copy} refreshing={refreshing} refresh={refresh} />
        <SecurityConnectionNotice data={data} error={error} degraded={view.degraded} copy={copy} />

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 sm:gap-4">
          <SecurityMetric label={copy.detections} value={view.detections} detail={copy.detectionsDetail} icon={Activity} tone="amber" pending={view.waiting} />
          <SecurityMetric label={copy.ipsBlocked} value={view.ipsBlocked} detail={copy.ipsDetail} icon={ShieldCheck} tone="green" pending={view.waiting} />
          <SecurityMetric label={copy.firewallBlocked} value={view.firewallBlocked} detail={copy.firewallDetail} icon={ShieldX} tone="blue" pending={view.waiting} />
          <SecurityMetric label={copy.originCountries} value={view.countries} detail={copy.countriesDetail} icon={Globe2} tone="neutral" pending={view.waiting} />
        </div>
        <p className="-mt-3 flex items-start gap-2 text-[11px] leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 h-3 w-3 shrink-0" />{copy.countsNotice}
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold">{copy.explore}</h2>
              <span className="font-mono text-[10px] text-muted-foreground">{data ? view.selectedCount.toLocaleString(locale) : "—"} {copy.observed}</span>
            </div>
            <div aria-label={copy.eventSource} className="flex items-center rounded-lg border border-border/50 bg-card/30 p-1">
              {(["all", "ids", "firewall"] as const).map((source) => <button key={source} type="button"
                aria-pressed={filter === source} onClick={() => setFilter(source)}
                className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                  filter === source ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}>
                {filterLabels[source]}
              </button>)}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SecurityWorldMap countries={data?.countries ?? []} locale={locale} loading={view.waiting} geoAvailable={data?.geoAvailable ?? false} />
            <SecurityRanking title={copy.topOrigins} icon={Globe2} empty={copy.empty}
              entries={(data?.countries ?? []).slice(0, 6).map((country) => ({
                label: countryName(country.code, locale), hint: country.code, value: country.count,
              }))} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SecurityRanking title={copy.categories} icon={Activity} empty={copy.empty}
              entries={(data?.categories ?? []).slice(0, 6).map((category) => ({
                label: categoryName(category.name, locale), value: category.count,
              }))} />
            <SecurityRanking title={copy.ports} icon={ArrowUpRight} empty={copy.empty}
              entries={(data?.ports ?? []).map((port) => ({ label: String(port.port), hint: port.protocol, value: port.count }))} />
          </div>
          <SecurityEventList events={data?.events ?? []} locale={locale} loading={view.waiting} />
        </div>

        <SecuritySourceStatus data={data} locale={locale} copy={copy} />
        <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] leading-relaxed text-muted-foreground/70">
          <p className="flex items-center gap-1.5"><LockKeyhole className="h-3 w-3" />{copy.privacy}</p>
          <p>Geo: <a href="https://db-ip.com/db/lite.php" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-primary">DB-IP Lite</a> (CC BY 4.0) · Map: Natural Earth</p>
        </div>
      </div>
    </div>
  );
}
