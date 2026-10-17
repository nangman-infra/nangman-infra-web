import type { LucideIcon } from "lucide-react";

type RankingProps = {
  title: string;
  icon: LucideIcon;
  entries: { label: string; value: number; hint?: string }[];
  empty: string;
};

export function SecurityRanking({ title, icon: Icon, entries, empty }: Readonly<RankingProps>) {
  const maximum = Math.max(1, ...entries.map((entry) => entry.value));
  return <section className="min-w-0 rounded-xl border border-border/50 bg-card/30 p-5 sm:p-6">
    <h2 className="mb-5 flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" />{title}</h2>
    {entries.length ? <ol className="space-y-4">
      {entries.map((entry, index) => <li key={`${entry.label}:${entry.hint ?? ""}`} className="relative">
        <div className="mb-2 flex items-center gap-2 text-xs">
          <span className="w-4 shrink-0 font-mono text-[10px] text-muted-foreground/60">{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0 flex-1 truncate">{entry.label}</span>
          {entry.hint && <span className="font-mono text-[10px] text-muted-foreground">{entry.hint}</span>}
          <span className="ml-2 font-mono tabular-nums">{entry.value.toLocaleString()}</span>
        </div>
        <div className="ml-6 h-1 overflow-hidden rounded-full bg-muted/40">
          <div className="h-full rounded-full bg-primary/65 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${entry.value / maximum * 100}%` }} />
        </div>
      </li>)}
    </ol> : <p className="py-6 text-center text-xs text-muted-foreground">{empty}</p>}
  </section>;
}
