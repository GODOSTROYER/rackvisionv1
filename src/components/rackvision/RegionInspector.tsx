import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { MiniSummaryCard } from "@/components/rackvision/MiniSummaryCard";
import { InspectorSummary } from "@/components/rackvision/inspector-types";

export function RegionInspector({ summary }: { summary: InspectorSummary }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{summary.entity.name}</h3>
        <div className="mt-1"><StatusBadge status={summary.entity.healthStatus} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniSummaryCard label="Sites" value={String(summary.counts.sites)} />
        <MiniSummaryCard label="Racks" value={String(summary.counts.racks)} />
        <MiniSummaryCard label="Devices" value={String(summary.counts.devices)} />
        <MiniSummaryCard label="Critical" value={String(summary.health.critical)} />
      </div>
      <MetricRow label="Warnings" value={String(summary.health.warning)} />
      <MetricRow label="Healthy" value={String(summary.health.healthy)} />
      <MetricRow label="Offline" value={String(summary.health.offline)} />
    </div>
  );
}
