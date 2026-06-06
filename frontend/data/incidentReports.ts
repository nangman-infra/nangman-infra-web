import { inc20260604Proxy001 } from "./incident-reports/inc-20260604-proxy-001";
import { inc20260503Npm001 } from "./incident-reports/inc-20260503-npm-001";
import { inc20260307Auth003 } from "./incident-reports/inc-20260307-auth-003";
import { inc20260301Auth001 } from "./incident-reports/inc-20260301-auth-001";
import { inc20260304Auth002 } from "./incident-reports/inc-20260304-auth-002";
import type { IncidentReport } from "./incident-reports/types";

export type {
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEntry,
} from "./incident-reports/types";

export const incidentReports: IncidentReport[] = [
  inc20260604Proxy001,
  inc20260503Npm001,
  inc20260307Auth003,
  inc20260301Auth001,
  inc20260304Auth002,
];
