import type { LucideIcon } from "lucide-react";

type MetricProps = {
  label: string;
  value: number | null;
  detail: string;
  icon: LucideIcon;
  tone: "amber" | "green" | "blue" | "neutral";
  pending: boolean;
};

const COLORS = {
  amber: "text-amber-500 dark:text-amber-400 bg-amber-500/10",
  green: "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10",
  blue: "text-sky-500 dark:text-sky-400 bg-sky-500/10",
  neutral: "text-foreground/70 bg-muted/50",
};

export function SecurityMetric({ label, value, detail, icon: Icon, tone, pending }: Readonly<MetricProps>) {
  return <article className="relative overflow-hidden rounded-xl border border-border/50 bg-card/30 p-4 sm:p-5">
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`rounded-lg p-2 ${COLORS[tone]}`}><Icon className="h-4 w-4" /></span>
    </div>
    <p className={`mt-3 font-mono text-3xl font-medium tracking-tight sm:text-4xl ${pending ? "motion-safe:animate-pulse text-muted-foreground" : ""}`}>
      {value === null ? "—" : value.toLocaleString()}
    </p>
    <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
  </article>;
}
