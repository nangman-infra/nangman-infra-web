import inc20260301Auth001 from "./incident-reports/inc-20260301-auth-001.json";
import inc20260304Auth002 from "./incident-reports/inc-20260304-auth-002.json";
import inc20260307Auth003 from "./incident-reports/inc-20260307-auth-003.json";
import inc20260503Npm001 from "./incident-reports/inc-20260503-npm-001.json";
import inc20260604Proxy001 from "./incident-reports/inc-20260604-proxy-001.json";
import type { IncidentReport } from "./incident-reports/types";

export type {
  IncidentReport,
  IncidentSeverity,
  IncidentStatus,
  IncidentTimelineEntry,
} from "./incident-reports/types";

export const incidentReports: IncidentReport[] = [
  inc20260604Proxy001 as IncidentReport,
  inc20260503Npm001 as IncidentReport,
  inc20260307Auth003 as IncidentReport,
  inc20260301Auth001 as IncidentReport,
  inc20260304Auth002 as IncidentReport,
];
