import { NextRequest, NextResponse } from "next/server";
import { fetchBackend } from "@/lib/server/backend-proxy";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("source") ?? "all";
  const headers = { "Cache-Control": "no-store" };
  if (!["all", "ids", "firewall"].includes(source)) {
    return NextResponse.json({ success: false, message: "Invalid security source." }, { status: 400, headers });
  }
  try {
    const response = await fetchBackend(`/api/v1/security/overview?source=${source}`, {
      cache: "no-store", headers: { Accept: "application/json" },
    }, 35_000);
    if (!response.ok) throw new Error("Security backend unavailable");
    return NextResponse.json(await response.json(), { headers });
  } catch {
    return NextResponse.json(
      { success: false, message: "Security data is temporarily unavailable." },
      { status: 503, headers },
    );
  }
}
