import {
  type IncidentReport,
  type IncidentSeverity,
  incidentReports,
} from "@/data/incidentReports";

export function getIncidentReports(): IncidentReport[] {
  return [...incidentReports].sort((a, b) =>
    b.startedAtIso.localeCompare(a.startedAtIso),
  );
}

export function getIncidentReportBySlug(
  slug: string,
): IncidentReport | undefined {
  return incidentReports.find((report) => report.slug === slug);
}

export function getIncidentSeverityStyle(severity: IncidentSeverity): string {
  if (severity === "SEV-1") {
    return "border-red-500/40 bg-red-500/10 text-red-300";
  }

  if (severity === "SEV-2") {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-300";
  }

  return "border-blue-500/40 bg-blue-500/10 text-blue-300";
}

export function getIncidentStatusLabel(status: IncidentReport["status"]): string {
  if (status === "resolved") {
    return "Resolved";
  }

  if (status === "mitigated") {
    return "Mitigated";
  }

  return "Investigating";
}
