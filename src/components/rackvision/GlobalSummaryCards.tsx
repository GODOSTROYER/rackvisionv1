import { GlobalSummary } from "@/components/rackvision/types";

export function GlobalSummaryCards({ summary }: { summary: GlobalSummary }) {
  const cards = [
    { label: "Total Regions", value: String(summary.totalRegions) },
    { label: "Total Sites", value: String(summary.totalSites) },
    { label: "Total Racks", value: String(summary.totalRacks) },
    { label: "Total Devices", value: String(summary.totalDevices) },
    { label: "Critical Alerts", value: String(summary.criticalAlerts) },
    { label: "Online vs Offline", value: `${summary.onlineCount}/${summary.offlineCount}` },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="text-lg font-semibold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
