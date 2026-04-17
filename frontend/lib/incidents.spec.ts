import { describe, expect, it } from "vitest";
import {
  getIncidentReportBySlug,
  getIncidentReports,
  getIncidentSeverityStyle,
  getIncidentStatusLabel,
} from "@/lib/incidents";

describe("incident helpers", () => {
  it("sorts incident reports by latest startedAtIso first", () => {
    const reports = getIncidentReports();

    expect(reports[0]?.startedAtIso >= reports[1]?.startedAtIso).toBe(true);
    expect(reports[1]?.startedAtIso >= reports[2]?.startedAtIso).toBe(true);
  });

  it("finds a report by slug", () => {
    const report = getIncidentReportBySlug("inc-20260307-auth-003");

    expect(report?.id).toBe("INC-20260307-AUTH-003");
  });

  it("returns severity styles for each severity level", () => {
    expect(getIncidentSeverityStyle("SEV-1")).toContain("red");
    expect(getIncidentSeverityStyle("SEV-2")).toContain("yellow");
    expect(getIncidentSeverityStyle("SEV-3")).toContain("blue");
  });

  it("returns localized incident status labels", () => {
    expect(getIncidentStatusLabel("resolved", "ko")).toBe("해결됨");
    expect(getIncidentStatusLabel("mitigated", "ko")).toBe("완화됨");
    expect(getIncidentStatusLabel("investigating", "ko")).toBe("조사 중");
    expect(getIncidentStatusLabel("resolved", "en")).toBe("Resolved");
    expect(getIncidentStatusLabel("mitigated", "en")).toBe("Mitigated");
    expect(getIncidentStatusLabel("investigating", "en")).toBe("Investigating");
  });
});
