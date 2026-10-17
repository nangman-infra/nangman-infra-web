import { Radio, ShieldCheck, ScanLine } from "lucide-react";
import { categoryName, countryName, eventTime, type SecurityLocale, type SecuritySnapshot } from "@/lib/domain/security";

export function SecurityEventList({ events, locale, loading }: {
  events: SecuritySnapshot["events"]; locale: SecurityLocale; loading: boolean;
}) {
  const ko = locale === "ko";
  return (
    <section className="overflow-hidden rounded-xl border border-border/50 bg-card/30">
      <div className="flex items-center justify-between gap-3 border-b border-border/40 px-5 py-5 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Radio className="h-4 w-4 text-primary" />
            {ko ? "최근 보안 이벤트" : "Recent security events"}
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {ko ? "최신 이벤트 최대 20건 · 내부 주소와 원본 IP는 공개하지 않습니다" : "Latest 20 events · Internal addresses and raw IPs are private"}
          </p>
        </div>
        <span className="shrink-0 font-mono text-[10px] tracking-wider text-muted-foreground">KST / UTC+9</span>
      </div>
      {events.length === 0 ? (
        <p className="px-6 py-14 text-center text-sm text-muted-foreground">
          {loading ? (ko ? "이벤트를 불러오는 중입니다" : "Loading events") :
            ko ? "현재 조회 결과에 해당하는 이벤트가 없습니다" : "No matching events in the current response"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/15 text-[11px] text-muted-foreground">
              <tr>
                <th className="whitespace-nowrap px-5 py-3 font-medium sm:px-6">{ko ? "발생 시각" : "Time"}</th>
                <th className="hidden px-3 py-3 font-medium sm:table-cell">{ko ? "출발 국가" : "Origin"}</th>
                <th className="px-3 py-3 font-medium">{ko ? "이벤트" : "Event"}</th>
                <th className="hidden px-3 py-3 font-medium md:table-cell">{ko ? "서비스 포트" : "Destination"}</th>
                <th className="whitespace-nowrap px-5 py-3 text-right font-medium sm:px-6">{ko ? "처리" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {events.map((event) => (
                <tr key={event.id} className="transition-colors hover:bg-muted/15">
                  <td className="whitespace-nowrap px-5 py-3.5 font-mono text-[11px] text-muted-foreground sm:px-6">
                    <time dateTime={event.timestamp} title={eventTime(event.timestamp, locale, true)}>
                      <span className="hidden lg:inline">{eventTime(event.timestamp, locale, true)}</span>
                      <span className="lg:hidden">{eventTime(event.timestamp, locale)}</span>
                    </time>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3.5 sm:table-cell">
                    <span className="mr-2 font-mono text-[10px] text-muted-foreground">{event.country}</span>
                    {countryName(event.country, locale)}
                  </td>
                  <td className="max-w-[160px] px-3 py-3.5 sm:max-w-[300px]">
                    <p className="truncate font-medium" title={event.signature}>
                      {event.source === "firewall" ? categoryName("Firewall", locale) : event.signature}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {event.source === "ids" ? "SURICATA" : "FIREWALL"}
                      <span className="sm:hidden"> · {countryName(event.country, locale)}</span>
                    </p>
                  </td>
                  <td className="hidden whitespace-nowrap px-3 py-3.5 font-mono text-[11px] text-muted-foreground md:table-cell">
                    {event.port !== null ? `${event.port} / ${event.protocol}` : event.protocol}
                  </td>
                  <td className="px-5 py-3.5 text-right sm:px-6">
                    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] ${
                      event.action === "blocked" ? "bg-emerald-500/8 text-emerald-500 dark:text-emerald-400" : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}>
                      {event.action === "blocked" ? <ShieldCheck className="h-3 w-3" /> : <ScanLine className="h-3 w-3" />}
                      {event.action === "blocked" ? (ko ? "차단" : "Blocked") : (ko ? "탐지" : "Detected")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
