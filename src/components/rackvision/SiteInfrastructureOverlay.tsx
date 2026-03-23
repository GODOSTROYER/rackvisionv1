import { Building2, Thermometer, Zap } from "lucide-react";
import { SiteSummary } from "@/components/rackvision/types";
import { MiniSummaryCard } from "./MiniSummaryCard";

type SiteInfrastructureOverlayProps = {
  siteName: string;
  summary: SiteSummary;
  roomCount: number;
  rowCount: number;
};

export function SiteInfrastructureOverlay({ siteName, summary, roomCount, rowCount }: SiteInfrastructureOverlayProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex items-center gap-2">
          <Building2 className="h-4 w-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">{siteName} Infrastructure Overlay</p>
            <p className="text-xs text-muted-foreground">Progressive drill-down: Site → Rooms → Rows → Racks</p>
          </div>
        </div>
        <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Thermometer className="h-3.5 w-3.5" /> {summary.avgTemp}°C
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" /> {summary.powerUtilization ?? 0}%
          </span>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
        <MiniSummaryCard label="Rooms" value={String(roomCount)} />
        <MiniSummaryCard label="Rows" value={String(rowCount)} />
        <MiniSummaryCard label="Racks" value={String(summary.totalRacks)} />
        <MiniSummaryCard label="Devices" value={String(summary.totalDevices)} />
        <MiniSummaryCard label="Alerts" value={String(summary.activeAlerts)} />
        <MiniSummaryCard label="Occupancy" value={`${summary.occupancyPercent}%`} />
      </div>
    </div>
  );
}