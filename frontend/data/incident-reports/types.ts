export type IncidentSeverity = "SEV-1" | "SEV-2" | "SEV-3";
export type IncidentStatus = "resolved" | "investigating" | "mitigated";

export interface IncidentTimelineEntry {
  at: string;
  event: string;
  evidence?: string;
}

export interface IncidentReport {
  id: string;
  slug: string;
  title: string;
  status: IncidentStatus;
  severity: IncidentSeverity;
  startedAtIso: string;
  resolvedAtIso: string;
  startedAt: string;
  resolvedAt: string;
  owner: string;
  impactedService: string;
  summary: string;
  technicalImpact: string;
  topology: string[];
  rootCause: string;
  contributingFactors: string[];
  evidence: string[];
  timeline: IncidentTimelineEntry[];
  resolution: string[];
  followUp: {
    title: string;
    scope: string;
    checklist: string[];
    exitCriteria: string;
  };
  tags: string[];
}
