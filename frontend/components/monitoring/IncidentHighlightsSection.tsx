import { AlertTriangle, ArrowRight, Clock3 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  getIncidentReports,
  getIncidentSeverityStyle,
  getIncidentStatusLabel,
} from "@/lib/incidents";

const MAX_HIGHLIGHT_COUNT = 3;

export function IncidentHighlightsSection() {
  const locale = useLocale();
  const t = useTranslations("IncidentsPage");
  const reports = getIncidentReports().slice(0, MAX_HIGHLIGHT_COUNT);

  if (reports.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 w-full px-4 pb-16 bg-[#020203]">
      <div className="max-w-[1800px] mx-auto">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/5 pb-5">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-xs font-mono tracking-[0.2em] uppercase opacity-70">
                Operations / Incidents
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase italic">
              {t("highlightsTitle")}
            </h2>
          </div>

          <Link
            href="/incidents"
            className="inline-flex items-center gap-1 text-xs md:text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <span>{t("viewAll")}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <article
              key={report.id}
              className="rounded-xl border border-white/10 bg-[#0d0d0f] p-4"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] font-mono text-white/80">
                  {report.id}
                </span>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono ${getIncidentSeverityStyle(report.severity)}`}
                >
                  {report.severity}
                </span>
                <span className="inline-flex items-center rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[11px] font-mono text-green-300">
                  {getIncidentStatusLabel(report.status, locale as "ko" | "en")}
                </span>
              </div>

              <h3 className="text-sm md:text-base font-semibold text-white leading-snug mb-2">
                {report.title}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed mb-3 line-clamp-3">
                {report.technicalImpact}
              </p>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] text-white/55">
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>{report.startedAt}</span>
                </div>

                <Link
                  href={`/incidents/${report.slug}`}
                  className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                >
                  <span>{t("detail")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
