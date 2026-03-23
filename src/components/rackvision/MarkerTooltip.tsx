import { StatusBadge } from "@/components/enterprise/StatusBadge";
import { GlobeMarker } from "@/components/rackvision/types";

type MarkerTooltipProps = {
  marker: GlobeMarker;
  regionName?: string;
};

export function MarkerTooltip({ marker, regionName }: MarkerTooltipProps) {
  return (
    <div className="w-60 rounded-lg border border-border bg-popover p-3 shadow-lg">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-popover-foreground">{marker.name}</p>
        <StatusBadge status={marker.healthStatus} />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {marker.kind === "region" ? <p>Sites: <span className="text-foreground">{marker.metrics.sites ?? 0}</span></p> : null}
        {marker.kind === "site" ? <p>Region: <span className="text-foreground">{regionName ?? "-"}</span></p> : null}
        <p>Racks: <span className="text-foreground">{marker.metrics.racks}</span></p>
        <p>Devices: <span className="text-foreground">{marker.metrics.devices}</span></p>
        <p>Warning: <span className="text-foreground">{marker.metrics.warning}</span></p>
        <p>Critical: <span className="text-foreground">{marker.metrics.critical}</span></p>
        <p>Alerts: <span className="text-foreground">{marker.metrics.activeAlerts}</span></p>
        {typeof marker.metrics.occupancyPercent === "number" ? (
          <p>Occupancy: <span className="text-foreground">{marker.metrics.occupancyPercent}%</span></p>
        ) : null}
      </div>
    </div>
  );
}
