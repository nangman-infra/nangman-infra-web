import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchBackend } from "@/lib/server/backend-proxy";
import { GET } from "@/app/api/security/overview/route";

vi.mock("@/lib/server/backend-proxy", () => ({ fetchBackend: vi.fn() }));

beforeEach(() => {
  vi.mocked(fetchBackend).mockReset();
});

describe("public security proxy", () => {
  it.each(["all", "ids", "firewall"])("forwards only the %s read filter without caching", async (source) => {
    const payload = { success: true, data: { filter: source, events: [] } };
    vi.mocked(fetchBackend).mockResolvedValue(Response.json(payload));
    const response = await GET(new NextRequest(`http://localhost/api/security/overview?source=${source}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual(payload);
    expect(fetchBackend).toHaveBeenCalledWith(`/api/v1/security/overview?source=${source}`, expect.objectContaining({ cache: "no-store" }), 35_000);
  });

  it("defaults to all and rejects a filter before querying the backend", async () => {
    vi.mocked(fetchBackend).mockResolvedValue(Response.json({ success: true }));
    await GET(new NextRequest("http://localhost/api/security/overview"));
    expect(fetchBackend).toHaveBeenCalledWith("/api/v1/security/overview?source=all", expect.any(Object), 35_000);
    vi.mocked(fetchBackend).mockClear();
    const invalid = await GET(new NextRequest("http://localhost/api/security/overview?source=admin"));
    expect(invalid.status).toBe(400);
    expect(fetchBackend).not.toHaveBeenCalled();
  });

  it.each(["http", "network", "json"])("conceals upstream %s failures", async (failure) => {
    const secretDetail = "private upstream diagnostics";
    if (failure === "network") {
      vi.mocked(fetchBackend).mockRejectedValue(new Error(secretDetail));
    } else {
      const status = failure === "http" ? 403 : 200;
      vi.mocked(fetchBackend).mockResolvedValue(new Response(secretDetail, { status }));
    }
    const response = await GET(new NextRequest("http://localhost/api/security/overview"));
    expect(response.status).toBe(503);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.text()).not.toContain(secretDetail);
  });
});
