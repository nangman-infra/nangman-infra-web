import Link from "next/link";
import { AlertTriangle, ArrowRight, Clock3, Network, UserCircle2 } from "lucide-react";
import {
  getIncidentReports,
  getIncidentSeverityStyle,
  getIncidentStatusLabel,
} from "@/lib/incidents";

export default function IncidentsPage() {
  const reports = getIncidentReports();
  const incidentCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Nangman Infra Incident Reports",
    url: "https://nangman.cloud/incidents",
    description: "운영 중 발생한 장애 이력과 포스트모텀 보고서를 공개합니다.",
    inLanguage: "ko-KR",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: reports.map((report, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://nangman.cloud/incidents/${report.slug}`,
        name: report.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(incidentCollectionSchema),
        }}
      />
      <div className="min-h-screen pt-24 pb-16 px-4">
        <div className="relative max-w-7xl mx-auto">
          <div className="space-y-10 animate-in fade-in duration-500">
          <div
            className="text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ animationDelay: "80ms", animationFillMode: "both" }}
          >
            <div className="inline-flex items-center gap-2 text-primary mb-3">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-mono tracking-[0.2em] uppercase opacity-70">
                Operations / Incident Reports
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              장애 이력 및 포스트모텀
            </h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              인증·인프라 장애의 원인, 기술 근거, 재발 방지 조치를 기록합니다.
            </p>
          </div>

            <div className="grid grid-cols-1 gap-5">
              {reports.map((report, index) => (
                <article
                  key={report.id}
                  className="rounded-xl border border-border/30 bg-card/20 p-5 md:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{
                    animationDelay: `${160 + index * 70}ms`,
                    animationFillMode: "both",
                  }}
                >
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

                  <h2 className="text-lg md:text-xl font-semibold mb-2">
                    {report.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {report.technicalImpact}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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

                  <Link
                    href={`/incidents/${report.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    <span>포스트모텀 상세 보기</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
