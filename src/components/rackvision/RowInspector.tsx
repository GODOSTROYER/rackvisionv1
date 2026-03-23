import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { InspectorSummary } from "@/components/rackvision/inspector-types";

export function RowInspector({ summary }: { summary: InspectorSummary }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{summary.entity.name}</h3>
        <p className="text-xs text-muted-foreground">Row</p>
        <div className="mt-1"><StatusBadge status={summary.entity.healthStatus} /></div>
      </div>
      <MetricRow label="Racks" value={String(summary.counts.racks)} />
      <MetricRow label="Devices" value={String(summary.counts.devices)} />
      <MetricRow label="Health Rollup" value={summary.health.rollupStatus} />
      <div className="rounded-md border border-border bg-muted/20 p-2">
        <p className="mb-1 text-[11px] text-muted-foreground">Racks in row</p>
        <div className="space-y-1">
          {summary.children.filter((item) => item.kind === "rack").map((rack) => (
            <p key={rack.id} className="text-xs text-foreground">• {rack.name}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
