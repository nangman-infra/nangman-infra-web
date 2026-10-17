"use client";

import { useState } from "react";
import { Globe2, MapPin } from "lucide-react";
import world from "@/data/security-world.json";
import { countryName, type SecurityLocale, type SecuritySnapshot } from "@/lib/domain/security";

type Props = {
  countries: SecuritySnapshot["countries"];
  locale: SecurityLocale;
  loading: boolean;
  geoAvailable: boolean;
};

export function SecurityWorldMap({ countries, locale, loading, geoAvailable }: Props) {
  const ko = locale === "ko";
  const [hovered, setHovered] = useState<string | null>(null);
  const byCode = new Map(countries.map((country) => [country.code, country]));
  const known = countries.filter((country) => country.code !== "ZZ");
  const max = Math.max(1, ...known.map((country) => country.count));
  const selected = hovered ? byCode.get(hovered) : null;
  const positions = new Map(world.countries.map((country) => [country.c, country]));
  const destination = positions.get("KR");
  const routes = known.slice(0, 8).filter((country) => country.code !== "KR" && positions.has(country.code));
  const visible = known.length > 0 && geoAvailable;

  return (
    <section className="relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-border/50 bg-card/30 lg:col-span-2">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Globe2 className="h-4 w-4 text-primary" />
            {ko ? "탐지 출발 국가" : "Observed origins"}
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {ko ? "외부 유입 이벤트의 지리적 분포" : "Geographic distribution of inbound events"}
          </p>
        </div>
        <span className="rounded-md border border-primary/15 bg-primary/5 px-2.5 py-1 font-mono text-[10px] tracking-wider text-primary">
          {ko ? `${known.length}개 국가` : `${known.length} COUNTRIES`}
        </span>
      </div>
      <div className="relative flex flex-1 items-center px-2 py-5 sm:px-5 sm:py-7">
        <svg viewBox={`0 0 ${world.w} ${world.h}`} role="img"
          aria-label={ko ? "출발 IP의 추정 국가 지도. 아래에 국가별 목록이 있습니다." : "Estimated source countries. A country list follows."}
          className="relative w-full overflow-visible">
          <defs>
            <radialGradient id="security-map-glow">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity=".09" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
            <pattern id="security-map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth=".5" opacity=".07" />
            </pattern>
          </defs>
          <rect width={world.w} height={world.h} fill="url(#security-map-grid)" />
          <ellipse cx="720" cy="200" rx="350" ry="210" fill="url(#security-map-glow)" />
          {world.countries.map((country) => {
            const count = byCode.get(country.c)?.count ?? 0;
            const active = count > 0 && geoAvailable;
            return <path key={country.c} d={country.d}
              fill={active ? `rgba(245,158,11,${0.16 + (count / max) * 0.48})` : "currentColor"}
              fillOpacity={active ? 1 : 0.065}
              stroke={hovered === country.c ? "#fbbf24" : active ? "rgba(245,158,11,.36)" : "currentColor"}
              strokeOpacity={active || hovered === country.c ? 1 : 0.14}
              strokeWidth={hovered === country.c ? 1.6 : 0.6}
              onMouseEnter={() => setHovered(country.c)}
              onMouseLeave={() => setHovered(null)}
              className="transition-colors duration-300">
              <title>{`${countryName(country.c, locale)}: ${count.toLocaleString(locale)}`}</title>
            </path>;
          })}
          {visible && destination && routes.map((country) => {
            const point = positions.get(country.code)!;
            const height = Math.min(140, Math.abs(point.x - destination.x) * .23 + 20);
            return <g key={country.code} pointerEvents="none">
              <path d={`M${point.x},${point.y} Q${(point.x + destination.x) / 2},${Math.min(point.y, destination.y) - height} ${destination.x},${destination.y}`}
                fill="none" stroke="#f59e0b" strokeWidth=".9" strokeOpacity=".38" strokeDasharray="3 5" />
              <circle cx={point.x} cy={point.y} r={2.5 + Math.sqrt(country.count / max) * 3} fill="#fbbf24" fillOpacity=".85" />
            </g>;
          })}
          {visible && destination && <g pointerEvents="none">
            <circle cx={destination.x} cy={destination.y} r="17" fill="#f59e0b" fillOpacity=".08" />
            <circle cx={destination.x} cy={destination.y} r="10" fill="none" stroke="#f59e0b" strokeOpacity=".4" />
            <circle cx={destination.x} cy={destination.y} r="4" fill="#fcd34d" />
            <text x={destination.x + 16} y={destination.y + 4} fill="#fbbf24" fontSize="10" fontFamily="monospace">NANGMAN</text>
          </g>}
        </svg>
        {(!visible || loading) && <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <p className="rounded-lg border border-border/60 bg-background/90 px-5 py-3 text-sm text-muted-foreground">
            {loading ? (ko ? "최신 보안 데이터를 불러오는 중" : "Loading the latest security data") :
              !geoAvailable ? (ko ? "국가 정보 연결 대기 중" : "Country information unavailable") :
                (ko ? "조회된 국가 정보가 없습니다" : "No source countries in this response")}
          </p>
        </div>}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 px-5 py-3 text-[11px] text-muted-foreground sm:px-6">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-primary/70" />
          {selected ? `${countryName(selected.code, locale)} · ${selected.count.toLocaleString(locale)} ${ko ? "건" : "events"}` :
            ko ? "출발 IP의 추정 위치 · 실제 공격자 위치와 다를 수 있습니다" : "Estimated IP location, not attacker attribution"}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          {ko ? "관측 이벤트" : "Observed events"}
        </span>
      </div>
    </section>
  );
}
