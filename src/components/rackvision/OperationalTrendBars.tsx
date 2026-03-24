import { cn } from "@/lib/utils";

type OperationalTrendBarsProps = {
  title: string;
  valueLabel?: string;
  points: Array<{ label: string; value: number }>;
  tone?: "default" | "warning" | "critical" | "healthy";
};

const toneMap: Record<NonNullable<OperationalTrendBarsProps["tone"]>, string> = {
  default: "bg-primary",
  warning: "bg-amber-500",
  critical: "bg-destructive",
  healthy: "bg-emerald-500",
};

export function OperationalTrendBars({ title, valueLabel, points, tone = "default" }: OperationalTrendBarsProps) {
  const max = Math.max(...points.map((point) => point.value), 1);

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
        {valueLabel ? <p className="text-[11px] text-muted-foreground">{valueLabel}</p> : null}
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {points.map((point) => {
          const height = Math.max(18, Math.round((point.value / max) * 100));
          return (
            <div key={`${title}-${point.label}`} className="flex flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end rounded-md bg-muted/30 p-1">
                <div
                  className={cn("w-full rounded-md transition-all", toneMap[tone])}
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
