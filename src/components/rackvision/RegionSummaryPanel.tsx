import { RegionSummary } from "@/components/rackvision/types";

export function RegionSummaryPanel({ summary }: { summary: RegionSummary }) {
  const cards = [
    { label: "Sites in Region", value: String(summary.sitesInRegion) },
    { label: "Total Racks", value: String(summary.totalRacks) },
    { label: "Total Devices", value: String(summary.totalDevices) },
    { label: "Active Alerts", value: String(summary.activeAlerts) },
    { label: "Avg Utilization", value: `${summary.avgUtilization}%` },
    { label: "Health Score", value: `${summary.healthScore}/100` },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">Region Summary</p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-border bg-muted/20 p-2">
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
            <p className="text-sm font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
