import { SiteSummary } from "@/components/rackvision/types";

export function SiteSummaryCards({ summary }: { summary: SiteSummary }) {
  const cards = [
    { label: "Total Rooms", value: String(summary.totalRooms ?? 0) },
    { label: "Total Rows", value: String(summary.totalRows ?? 0) },
    { label: "Total Racks", value: String(summary.totalRacks) },
    { label: "Total Devices", value: String(summary.totalDevices) },
    { label: "Occupancy", value: `${summary.occupancyPercent}%` },
    { label: "Active Alerts", value: String(summary.activeAlerts) },
    { label: "Avg Temperature", value: `${summary.avgTemp}°C` },
    { label: "Power Utilization", value: `${summary.powerUtilization ?? 0}%` },
    { label: "Health Score", value: `${summary.healthScore ?? 0}/100` },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <p className="text-xs text-muted-foreground">{card.label}</p>
          <p className="text-base font-semibold text-foreground">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
