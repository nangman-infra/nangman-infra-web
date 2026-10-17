// @vitest-environment jsdom

import { act, createElement, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useSecurityOverview } from "@/hooks/useSecurityOverview";
import type { SecurityFilter, SecuritySnapshot } from "@/lib/domain/security";

type OverviewState = ReturnType<typeof useSecurityOverview>;
let current: OverviewState | undefined;
let root: Root;
let container: HTMLDivElement;
const fetchMock = vi.fn<typeof fetch>();

function snapshot(filter: SecurityFilter = "all", revision = "first"): SecuritySnapshot {
  return {
    configured: true, generatedAt: revision, refreshIntervalSeconds: 10, filter,
    summary: { detections: 0, ipsBlocked: 0, firewallBlocked: 0, countries: 0 },
    countries: [], categories: [], ports: [], events: [], sources: [],
    geoAvailable: true, engine: { status: "running", enabledRulesets: 1 },
  };
}

function response(data: SecuritySnapshot): Response {
  return Response.json({ success: true, data });
}

function Probe({ filter }: Readonly<{ filter: SecurityFilter }>) {
  const overview = useSecurityOverview(filter);
  useEffect(() => { current = overview; }, [overview]);
  return createElement("output", null, overview.data?.generatedAt ?? "waiting");
}

async function render(filter: SecurityFilter = "all") {
  await act(async () => root.render(createElement(Probe, { filter })));
}

async function advance(milliseconds = 10_000) {
  await act(async () => { await vi.advanceTimersByTimeAsync(milliseconds); });
}

beforeEach(() => {
  vi.useFakeTimers();
  current = undefined;
  fetchMock.mockReset().mockImplementation(async () => response(snapshot()));
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(document, "hidden", "get").mockReturnValue(false);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("live security refresh lifecycle", () => {
  it("loads without caching, refreshes after ten seconds, and supports manual refresh", async () => {
    await render();
    expect(current?.data?.generatedAt).toBe("first");
    expect(fetchMock).toHaveBeenCalledWith("/api/security/overview?source=all", expect.objectContaining({ cache: "no-store" }));
    fetchMock.mockImplementation(async () => response(snapshot("all", "second")));
    await advance(9_999);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await advance(1);
    expect(current?.data?.generatedAt).toBe("second");
    await act(async () => current?.refresh());
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(current?.refreshing).toBe(false);
    expect(current?.error).toBe(false);
  });

  it("preserves a successful response during failure and recovers on the next read", async () => {
    await render();
    fetchMock.mockRejectedValueOnce(new Error("upstream unavailable"));
    await advance();
    expect(current).toMatchObject({ error: true, refreshing: false, data: { generatedAt: "first" } });
    fetchMock.mockImplementation(async () => response(snapshot("all", "recovered")));
    await advance();
    expect(current).toMatchObject({ error: false, data: { generatedAt: "recovered" } });
  });

  it.each([
    { status: 503, body: { success: false } },
    { status: 200, body: { success: false } },
    { status: 200, body: { success: true, data: snapshot("firewall") } },
    { status: 200, body: { success: true, data: { filter: "all", events: [] } } },
    { status: 200, body: { success: true, data: { filter: "all", sources: [] } } },
  ])("rejects an invalid overview response %# without inventing data", async ({ status, body }) => {
    fetchMock.mockResolvedValue(Response.json(body, { status }));
    await render();
    expect(current).toMatchObject({ data: null, error: true, refreshing: false });
  });

  it("aborts an old filter request and ignores its late response", async () => {
    const pending = Promise.withResolvers<Response>();
    fetchMock.mockReturnValueOnce(pending.promise);
    await render();
    const oldSignal = fetchMock.mock.calls[0][1]?.signal;
    fetchMock.mockResolvedValue(response(snapshot("ids", "ids-only")));
    await render("ids");
    expect(oldSignal?.aborted).toBe(true);
    await act(async () => pending.resolve(response(snapshot("all", "obsolete"))));
    expect(current?.data).toMatchObject({ filter: "ids", generatedAt: "ids-only" });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/security/overview?source=ids", expect.any(Object));
  });

  it("does not show a previous filter's data when the new filter fails", async () => {
    await render();
    fetchMock.mockRejectedValueOnce(new Error("unavailable"));
    await render("firewall");
    expect(current).toMatchObject({ data: null, error: true, refreshing: false });
  });

  it("pauses while hidden and refreshes when the page becomes visible", async () => {
    const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    await render();
    expect(fetchMock).not.toHaveBeenCalled();
    hidden.mockReturnValue(false);
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(true);
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    await advance(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    hidden.mockReturnValue(false);
    await act(async () => { document.dispatchEvent(new Event("visibilitychange")); });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(current?.error).toBe(false);
  });

  it("cancels polling and aborts the active signal on unmount", async () => {
    await render();
    const signal = fetchMock.mock.calls[0][1]?.signal;
    await act(async () => root.render(null));
    expect(signal?.aborted).toBe(true);
    await advance(30_000);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
