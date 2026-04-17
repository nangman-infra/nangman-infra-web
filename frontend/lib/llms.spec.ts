import { describe, expect, it } from "vitest";
import { getLlmsFullText, getLlmsText } from "@/lib/llms";

describe("llms guide helpers", () => {
  it("builds the concise llms text with canonical context", () => {
    const content = getLlmsText();

    expect(content).toContain("# Nangman Infra");
    expect(content).toContain("Canonical site: https://nangman.cloud/ko");
    expect(content).toContain("Localized URLs: /ko/* and /en/*");
    expect(content).toContain("Detailed machine-readable guide: https://nangman.cloud/llms-full.txt");
  });

  it("builds the full llms guide including incident report entries", () => {
    const content = getLlmsFullText();

    expect(content).toContain("# Nangman Infra Full Guide");
    expect(content).toContain("## Incident Reports");
    expect(content).toContain("inc-20260307-auth-003");
    expect(content).toContain("severity=SEV-2");
    expect(content).toContain("status=resolved");
  });
});
