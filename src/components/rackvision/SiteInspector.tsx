import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { MetricRow } from "@/components/rackvision/MetricRow";
import { MiniSummaryCard } from "@/components/rackvision/MiniSummaryCard";
import { InspectorSummary } from "@/components/rackvision/inspector-types";

export function SiteInspector({ summary }: { summary: InspectorSummary }) {
  const metrics = summary.siteMetrics;
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{summary.entity.name}</h3>
        <p className="text-xs text-muted-foreground">Site / Data Center</p>
        <div className="mt-1"><StatusBadge status={summary.entity.healthStatus} /></div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MiniSummaryCard label="Rooms" value={String(summary.counts.rooms)} />
        <MiniSummaryCard label="Rows" value={String(summary.counts.rows)} />
        <MiniSummaryCard label="Racks" value={String(summary.counts.racks)} />
        <MiniSummaryCard label="Devices" value={String(summary.counts.devices)} />
      </div>
      <MetricRow label="Occupancy" value={`${metrics?.occupancy ?? 0}%`} />
      <MetricRow label="Avg Temp" value={`${metrics?.avgTemp ?? 0}°C`} />
      <MetricRow label="Power Utilization" value={`${metrics?.powerUtilization ?? 0}%`} />
      <MetricRow label="Active Alerts" value={String(metrics?.activeAlerts ?? 0)} />
    </div>
  );
}
