import { getLlmsText } from "@/lib/llms";

export function GET() {
  return new Response(getLlmsText(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
