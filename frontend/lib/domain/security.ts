export type SecurityFilter = "all" | "ids" | "firewall";
export type SecurityLocale = "ko" | "en";

export interface SecuritySourceState {
  source: "ids" | "firewall";
  lastSuccess: string | null;
  oldest: string | null;
  newest: string | null;
  received: number;
  matched: number;
  limit: number;
  stale: boolean;
  error: "permission" | "connection" | "configuration" | null;
}

export interface SecuritySnapshot {
  configured: boolean;
  generatedAt: string;
  refreshIntervalSeconds: number;
  filter: SecurityFilter;
  summary: {
    detections: number;
    ipsBlocked: number;
    firewallBlocked: number;
    countries: number;
  };
  countries: { code: string; count: number; blocked: number }[];
  categories: { name: string; count: number }[];
  ports: { port: number; protocol: string; count: number }[];
  events: {
    id: string;
    timestamp: string;
    source: "ids" | "firewall";
    action: "detected" | "blocked";
    country: string;
    category: string;
    /** Broad category only. Event labels must not render this legacy field. */
    signature: string;
    protocol: string;
    port: number | null;
  }[];
  sources: SecuritySourceState[];
  geoAvailable: boolean;
  engine: { status: "running" | "stopped" | null; enabledRulesets: number | null };
}

export function countryName(code: string, locale: SecurityLocale): string {
  if (code === "ZZ") return locale === "ko" ? "국가 미확인" : "Unknown";
  // Fixed labels keep server and browser output identical across ICU versions.
  const labels: Record<string, { ko: string; en: string }> = countryNames;
  return labels[code]?.[locale] ?? code;
}

export function eventTime(value: string | null, locale: SecurityLocale, date = false): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-GB", {
    timeZone: "Asia/Seoul",
    ...(date ? { month: "2-digit", day: "2-digit" } as const : {}),
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
  }).format(new Date(value));
}

const CATEGORIES: Record<string, [string, string]> = {
  Reputation: ["위협 IP 평판", "IP reputation"],
  Scanning: ["포트·서비스 스캔", "Scanning"],
  Exploit: ["취약점 공격 탐지", "Exploit detection"],
  Malware: ["악성코드 관련", "Malware"],
  Web: ["웹 공격 탐지", "Web detection"],
  DNS: ["DNS 관련", "DNS"],
  Policy: ["정책·정보 알림", "Policy / information"],
  Other: ["기타 탐지", "Other detections"],
  Firewall: ["방화벽 정책 차단", "Firewall policy"],
};

export function categoryName(name: string, locale: SecurityLocale): string {
  return CATEGORIES[name]?.[locale === "ko" ? 0 : 1] ?? name;
}

const EVENT_LABELS: Record<string, Record<"blocked" | "detected", [string, string]>> = {
  Reputation: { blocked: ["평판 기반 차단", "Reputation-based block"], detected: ["평판 기반 탐지", "Reputation-based detection"] },
  Scanning: { blocked: ["스캔 차단", "Scan blocked"], detected: ["스캔 탐지", "Scan detected"] },
  Exploit: { blocked: ["취약점 공격 차단", "Exploit blocked"], detected: ["취약점 공격 탐지", "Exploit detected"] },
  Malware: { blocked: ["악성코드 관련 차단", "Malware-related block"], detected: ["악성코드 관련 탐지", "Malware-related detection"] },
  Web: { blocked: ["웹 공격 차단", "Web attack blocked"], detected: ["웹 공격 탐지", "Web attack detected"] },
  DNS: { blocked: ["DNS 관련 차단", "DNS-related block"], detected: ["DNS 관련 탐지", "DNS-related detection"] },
  Policy: { blocked: ["정책 기반 차단", "Policy-based block"], detected: ["정책 알림", "Policy alert"] },
  Other: { blocked: ["기타 차단", "Other block"], detected: ["기타 탐지", "Other detection"] },
};

export function eventName(
  event: Pick<SecuritySnapshot["events"][number], "source" | "category" | "action">,
  locale: SecurityLocale,
): string {
  if (event.source === "firewall") return categoryName("Firewall", locale);
  const category = Object.hasOwn(EVENT_LABELS, event.category) ? event.category : "Other";
  return EVENT_LABELS[category][event.action][locale === "ko" ? 0 : 1];
}
import countryNames from "@/data/security-country-names.json";
