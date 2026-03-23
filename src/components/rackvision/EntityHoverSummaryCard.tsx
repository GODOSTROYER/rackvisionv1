import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { EntityHoverSummary } from "@/components/rackvision/types";

type EntityHoverSummaryCardProps = {
  summary: EntityHoverSummary;
};

export function EntityHoverSummaryCard({ summary }: EntityHoverSummaryCardProps) {
  return (
    <div className="w-72 rounded-lg border border-border bg-popover p-3 shadow-lg">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-popover-foreground">{summary.title}</p>
          {summary.subtitle ? <p className="text-[11px] text-muted-foreground">{summary.subtitle}</p> : null}
        </div>
        <StatusBadge status={summary.healthStatus} />
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {summary.metrics.map((metric) => (
          <p key={metric.label}>
            {metric.label}: <span className="text-foreground">{metric.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}