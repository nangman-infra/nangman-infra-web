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
import countryNames from "@/data/security-country-names.json";
