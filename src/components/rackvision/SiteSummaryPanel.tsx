import { SiteSummary } from "@/components/rackvision/types";

export function SiteSummaryPanel({ summary, siteName }: { summary: SiteSummary; siteName: string }) {
  const cards = [
    { label: "Region", value: summary.regionName },
    { label: "Total Racks", value: String(summary.totalRacks) },
    { label: "Total Devices", value: String(summary.totalDevices) },
    { label: "Occupancy", value: `${summary.occupancyPercent}%` },
    { label: "Active Alerts", value: String(summary.activeAlerts) },
    { label: "Avg Temperature", value: `${summary.avgTemp}°C` },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <p className="mb-2 text-sm font-semibold text-foreground">{siteName} Summary</p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-border bg-muted/20 p-2">
            <p className="text-[11px] text-muted-foreground">{card.label}</p>
            <p className="text-sm font-semibold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Site overview and rack navigation visuals arrive in the next step.</p>
    </div>
  );
}
