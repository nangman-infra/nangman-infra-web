import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SecurityLocale, SecuritySnapshot } from "@/lib/domain/security";
import { securityView } from "@/lib/domain/security-view";
import { getSecurityCopy } from "@/content/security";
import { SecurityPage } from "@/components/security/SecurityPage";
import { SecurityWorldMap } from "@/components/security/SecurityWorldMap";
import { SecurityEventList } from "@/components/security/SecurityEventList";

const state = vi.hoisted(() => ({
  locale: "ko" as SecurityLocale,
  data: null as SecuritySnapshot | null,
  error: false,
  refreshing: false,
  refresh: vi.fn(),
}));

vi.mock("next-intl", () => ({ useLocale: () => state.locale }));
vi.mock("@/hooks/useSecurityOverview", () => ({
  useSecurityOverview: () => state,
}));

function snapshot(): SecuritySnapshot {
  return {
    configured: true, generatedAt: "2026-10-17T01:00:02Z", refreshIntervalSeconds: 10, filter: "all",
    summary: { detections: 4117, ipsBlocked: 23, firewallBlocked: 77, countries: 2 },
    countries: [{ code: "US", count: 4000, blocked: 20 }, { code: "KR", count: 190, blocked: 77 }, { code: "ZZ", count: 4, blocked: 3 }],
    categories: [{ name: "Scanning", count: 4117 }, { name: "Firewall", count: 77 }],
    ports: [{ port: 443, protocol: "TCP", count: 4117 }],
    events: [
      { id: "detection", source: "ids", action: "detected", country: "US", category: "Scanning", signature: "ET SCAN example", protocol: "TCP", port: 443, timestamp: "2026-10-17T01:00:00Z" },
      { id: "block", source: "firewall", action: "blocked", country: "KR", category: "Firewall", signature: "Firewall policy", protocol: "ICMP", port: null, timestamp: "2026-10-17T01:00:01Z" },
    ],
    sources: [
      { source: "ids", lastSuccess: "2026-10-17T01:00:00Z", oldest: "2026-10-16T01:00:00Z", newest: "2026-10-17T01:00:00Z", received: 5000, matched: 4117, limit: 5000, stale: false, error: null },
      { source: "firewall", lastSuccess: "2026-10-17T01:00:02Z", oldest: "2026-10-17T00:59:00Z", newest: "2026-10-17T01:00:01Z", received: 1000, matched: 77, limit: 1000, stale: false, error: null },
    ],
    geoAvailable: true, engine: { status: "running", enabledRulesets: 32 },
  };
}

function pageHtml(): string {
  return renderToStaticMarkup(createElement(SecurityPage));
}

beforeEach(() => {
  state.locale = "ko";
  state.data = snapshot();
  state.error = false;
  state.refreshing = false;
});

describe.each(["ko", "en"] as const)("security presentation in %s", (locale) => {
  beforeEach(() => { state.locale = locale; });

  it("renders live counts, geographic origins, actions, coverage and privacy notice", () => {
    const copy = getSecurityCopy(locale);
    const html = pageHtml();
    for (const label of [copy.title, copy.detections, copy.blocked, copy.detected, copy.privacy, copy.engineRunning, copy.sourceConnected]) {
      expect(html).toContain(label);
    }
    expect(html).toContain(">4,117</p>");
    expect(html).toContain("ET SCAN example");
    expect(html).toContain("443 / TCP");
    expect(html).toContain(`2${copy.countryCountSuffix}`);
    expect(html).toMatch(/<output[^>]*>.*LIVE<\/output>/);
    expect(html).not.toContain(copy.delayed);
  });

  it("keeps missing observations distinct from a measured zero", () => {
    state.data = null;
    state.refreshing = true;
    const html = pageHtml();
    const copy = getSecurityCopy(locale);
    expect(html).toContain("CONNECTING");
    expect(html).toContain(copy.loadingEvents);
    expect(html).toContain(copy.loadingMap);
    expect(html).toContain("disabled");
    expect(html).not.toContain(copy.delayed);
    expect(securityView(null, false, "all")).toMatchObject({ waiting: true, detections: null, countries: null });
  });

  it("shows an explicit setup state without presenting invented observations", () => {
    state.data = { ...snapshot(), configured: false, sources: [], events: [], countries: [], categories: [], ports: [], geoAvailable: false, engine: { status: null, enabledRulesets: null } };
    const html = pageHtml();
    const copy = getSecurityCopy(locale);
    expect(html).toContain(copy.configuring);
    expect(html).toContain(copy.emptyEvents);
    expect(html).toContain(copy.geoUnavailable);
    expect(html).toContain(copy.engineUnknown);
    expect(html).not.toContain(">4,117</p>");
  });

  it.each(["permission", "configuration", "connection"] as const)("retains prior counts while explaining a %s failure", (error) => {
    state.data!.sources[0] = { ...state.data!.sources[0], stale: true, error };
    const copy = getSecurityCopy(locale);
    const messages = { permission: copy.permissionError, configuration: copy.configurationError, connection: copy.connectionError };
    const html = pageHtml();
    expect(html).toContain("UPDATE DELAYED");
    expect(html).toContain(">4,117</p>");
    expect(html).toContain(copy.delayed);
    expect(html).toContain(copy.sourceDelayed);
    expect(html).toContain(messages[error]);
  });

  it("shows transport failure separately from the unconfigured state", () => {
    state.data = null;
    state.error = true;
    const html = pageHtml();
    expect(html).toContain(getSecurityCopy(locale).delayed);
    expect(html).not.toContain(getSecurityCopy(locale).configuring);
    expect(html).not.toContain("CONNECTING");
  });

  it("renders a stopped engine, zero rulesets and an empty map", () => {
    state.data!.engine = { status: "stopped", enabledRulesets: 0 };
    state.data!.countries = [];
    const html = pageHtml();
    const copy = getSecurityCopy(locale);
    expect(html).toContain(copy.engineStopped);
    expect(html).toContain(`${copy.enabledRulesets} 0`);
    expect(html).toContain(copy.emptyMap);
  });
});

describe("security view consistency", () => {
  it("filters observation counts while preserving the all-source overview cards", () => {
    const data = snapshot();
    const all = securityView(data, false, "all");
    const firewall = securityView(data, false, "firewall");
    expect(all.selectedCount).toBe(4194);
    expect(firewall.selectedCount).toBe(77);
    expect(securityView(data, false, "ids").selectedCount).toBe(4117);
    expect(firewall.detections).toBe(all.detections);
    expect(firewall.ipsBlocked).toBe(all.ipsBlocked);
    expect(all.latestSuccess).toBe("2026-10-17T01:00:02Z");
  });

  it("hides metrics for sources that have never succeeded and for unavailable geography", () => {
    const data = snapshot();
    data.sources[0].lastSuccess = null;
    data.sources[1].lastSuccess = null;
    data.geoAvailable = false;
    expect(securityView(data, true, "all")).toMatchObject({
      live: false, degraded: true, latestSuccess: null, detections: null, ipsBlocked: null, firewallBlocked: null, countries: null,
    });
  });

  it("does not draw origin routes without geography and ignores unknown geometry", () => {
    const countries = [...snapshot().countries, { code: "QQ", count: 10, blocked: 0 }];
    const html = renderToStaticMarkup(createElement(SecurityWorldMap, { countries, locale: "en", loading: false, geoAvailable: false }));
    expect(html).toContain("Country information unavailable");
    expect(html).not.toContain("stroke-dasharray");
    const located = renderToStaticMarkup(createElement(SecurityWorldMap, { countries, locale: "en", loading: false, geoAvailable: true }));
    expect(located).toContain("stroke-dasharray");
  });

  it("escapes signature markup instead of interpreting source text as HTML", () => {
    const events = snapshot().events;
    events[0].signature = "<script>alert(1)</script>";
    const html = renderToStaticMarkup(createElement(SecurityEventList, { events, locale: "en", loading: false }));
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
  });
});
