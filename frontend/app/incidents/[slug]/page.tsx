import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ClipboardList,
  Clock3,
  Network,
  UserCircle2,
} from "lucide-react";
import {
  getIncidentReportBySlug,
  getIncidentReports,
  getIncidentSeverityStyle,
  getIncidentStatusLabel,
} from "@/lib/incidents";

interface IncidentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getIncidentReports().map((report) => ({
    slug: report.slug,
  }));
}

export default async function IncidentDetailPage({
  params,
}: IncidentDetailPageProps) {
  const { slug } = await params;
  const report = getIncidentReportBySlug(slug);

  if (!report) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="relative max-w-5xl mx-auto space-y-8">
        <header className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center rounded-full border border-border/40 bg-card/40 px-2.5 py-0.5 text-xs font-mono text-foreground/80">
              {report.id}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono ${getIncidentSeverityStyle(report.severity)}`}
            >
              {report.severity}
            </span>
            <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-xs font-mono text-green-300">
              {getIncidentStatusLabel(report.status)}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold mb-3">{report.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">
            {report.summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg border border-border/30 bg-background/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Clock3 className="w-3.5 h-3.5" />
                기간
              </div>
              <p className="text-xs">{report.startedAt}</p>
              <p className="text-xs">{report.resolvedAt}</p>
            </div>

            <div className="rounded-lg border border-border/30 bg-background/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Network className="w-3.5 h-3.5" />
                영향 서비스
              </div>
              <p className="text-xs break-all">{report.impactedService}</p>
            </div>

            <div className="rounded-lg border border-border/30 bg-background/40 p-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <UserCircle2 className="w-3.5 h-3.5" />
                담당자
              </div>
              <p className="text-xs">{report.owner}</p>
            </div>
          </div>
        </header>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">기술 임팩트</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.technicalImpact}
          </p>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">서비스 토폴로지</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.topology.map((line) => (
              <li key={line}>- {line}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Root Cause</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {report.rootCause}
          </p>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Contributing Factors</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.contributingFactors.map((factor) => (
              <li key={factor}>- {factor}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Evidence</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.evidence.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Timeline</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.timeline.map((entry) => (
              <li key={`${entry.at}-${entry.event}`}>
                - {entry.at} | {entry.event}
                {entry.evidence ? ` (${entry.evidence})` : ""}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <h2 className="text-lg font-semibold mb-3">Resolution</h2>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {report.resolution.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold">{report.followUp.title}</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            적용 범위: {report.followUp.scope}
          </p>
          <ul className="space-y-1.5 text-sm text-muted-foreground mb-3">
            {report.followUp.checklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <p className="text-sm font-medium">
            종료 조건: {report.followUp.exitCriteria}
          </p>
        </section>

        <section className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-semibold">Tags</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full border border-border/40 bg-background/40 px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
